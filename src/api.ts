import {
	type Assignment,
	type CalendarEvent,
	priorityColor,
	type Todo,
	type TodoPriority,
} from "./types";

export async function fetchTodos(accessToken: string): Promise<Todo[]> {
	const BASE_URL = "https://tasks.googleapis.com";
	console.log("[fetchTodos] starting, accessToken present:", !!accessToken);
	const lists = await fetch(`${BASE_URL}/tasks/v1/users/@me/lists`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	console.log("[fetchTodos] lists response status:", lists.status);
	if (lists.status === 401) throw new Error("UNAUTHENTICATED");
	if (!lists.ok) {
		const body = await lists.text();
		console.error("[fetchTodos] lists error body:", body);
		throw new Error("Failed to fetch lists");
	}
	const listsData = await lists.json();
	console.log("[fetchTodos] listsData:", listsData);

	// Fetch every list's tasks in parallel instead of awaiting them one by one.
	const perListTodos = await Promise.all(
		(listsData.items ?? []).map((list: { id: string }) =>
			fetchListTodos(list.id, accessToken, BASE_URL),
		),
	);

	const todos = perListTodos.flat();
	console.log("[fetchTodos] mapped todos:", todos);
	return todos;
}

async function fetchListTodos(
	listId: string,
	accessToken: string,
	BASE_URL: string,
): Promise<Todo[]> {
	const response = await fetch(
		`${BASE_URL}/tasks/v1/lists/${listId}/tasks?showCompleted=false`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);
	if (response.status === 401) throw new Error("UNAUTHENTICATED");
	console.log("[fetchTodos] tasks response status:", response.status);
	if (!response.ok) {
		const body = await response.text();
		console.error("[fetchTodos] tasks error body:", body);
		throw new Error("Failed to fetch todos");
	}
	const data = await response.json();
	console.log("[fetchTodos] raw tasks data:", data);

	return (data.items ?? []).map(
		(item: {
			id: string;
			title: string;
			completed?: boolean; // usually boolean, not string
			webViewLink: string;
		}) => ({
			id: item.id,
			text: item.title,
			done: !!item.completed,
			webViewLink: item.webViewLink,
			listId,
			priority: "medium" as TodoPriority,
			badge: priorityColor.medium,
		}),
	);
}

export async function fetchAssignments(
	accessToken: string,
): Promise<Assignment[]> {
	const BASE_URL = "https://classroom.googleapis.com";
	console.log(
		"[fetchAssignments] starting, accessToken present:",
		!!accessToken,
	);

	const coursesUrl = new URL("/v1/courses", BASE_URL);
	const coursesParams = new URLSearchParams({ studentId: "me" });
	coursesParams.append("courseStates", "ACTIVE");
	coursesParams.append("courseStates", "PROVISIONED");
	coursesUrl.search = coursesParams.toString();

	console.log(
		"[fetchAssignments] fetching courses from:",
		coursesUrl.toString(),
	);

	const coursesRes = await fetch(coursesUrl.toString(), {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	console.log("[fetchAssignments] courses response status:", coursesRes.status);
	if (coursesRes.status === 401) throw new Error("UNAUTHENTICATED");
	if (!coursesRes.ok) {
		const body = await coursesRes.text();
		console.error("[fetchAssignments] courses error body:", body);
		throw new Error("Failed to fetch courses");
	}

	const coursesData = await coursesRes.json();
	// Added fallback in case the user has 0 active courses
	const courses = coursesData.courses || [];
	console.log("[fetchAssignments] courses found:", courses.length);

	// Fetch every course's assignments in parallel, then resolve each
	// assignment's submission state in parallel, instead of awaiting them
	// one at a time in nested loops.
	const perCourseAssignments = await Promise.all(
		courses.map((course: { id: string; name: string }) =>
			fetchCourseAssignments(course, accessToken, BASE_URL),
		),
	);

	const assignments: Assignment[] = perCourseAssignments.flat();

	console.log(
		`[fetchAssignments] finished. Total active assignments found: ${assignments.length}`,
	);
	return assignments;
}

async function fetchCourseAssignments(
	course: { id: string; name: string },
	accessToken: string,
	BASE_URL: string,
): Promise<Assignment[]> {
	console.log(
		"[fetchAssignments] fetching courseWork for course:",
		course.id,
		course.name,
	);

	const assignmentsUrl = new URL(
		`/v1/courses/${course.id}/courseWork`,
		BASE_URL,
	);
	assignmentsUrl.search = new URLSearchParams({
		orderBy: "dueDate asc",
		pageSize: Number(10).toString(),
	}).toString();

	const assignmentsRes = await fetch(assignmentsUrl.toString(), {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	console.log(
		"[fetchAssignments] courseWork response status:",
		assignmentsRes.status,
		"for course:",
		course.id,
	);

	if (!assignmentsRes.ok) {
		const body = await assignmentsRes.text();
		console.error(
			"[fetchAssignments] courseWork error body:",
			body,
			"for course:",
			course.id,
		);
		// Skip this course rather than failing the whole request.
		return [];
	}

	const assignmentsData = await assignmentsRes.json();
	const courseAssignments = assignmentsData.courseWork;

	console.log(
		"[fetchAssignments] courseAssignments count:",
		courseAssignments?.length ?? 0,
	);

	// Safeguard against courses with zero assignments
	if (!courseAssignments) {
		return [];
	}

	const resolved = await Promise.all(
		courseAssignments.map(
			async (assignment: {
				id: string;
				title: string;
				dueDate?: { year: number; month: number; day: number };
				dueTime?: { hours?: number; minutes?: number; seconds?: number };
			}): Promise<Assignment | null> => {
				const submissionUrl = new URL(
					`/v1/courses/${course.id}/courseWork/${assignment.id}/studentSubmissions`,
					BASE_URL,
				);
				submissionUrl.search = new URLSearchParams({
					userId: "me",
				}).toString();

				const submissionRes = await fetch(submissionUrl.toString(), {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				if (!submissionRes.ok) {
					console.error(
						`[fetchAssignments] Failed to fetch submission status for assignment:`,
						assignment.id,
					);
					return null;
				}

				const submissionData = await submissionRes.json();
				const submissions = submissionData.studentSubmissions;

				// Determine the submission state
				const state =
					submissions && submissions.length > 0 ? submissions[0].state : "NEW";

				// Skip this assignment if it is already turned in or graded
				if (state === "TURNED_IN" || state === "RETURNED") {
					return null;
				}

				return {
					id: assignment.id,
					course: course.name,
					title: assignment.title,
					due:
						GoogleDateToLocalDate(assignment.dueDate, assignment.dueTime) || "",
					hasAttachment: false,
				} satisfies Assignment;
			},
		),
	);

	return resolved.filter((a): a is Assignment => a !== null);
}
export type Email = {
	id: number;
	from: string;
	subject: string;
	time: string;
	unread: boolean;
};

export async function fetchEmails(accessToken: string): Promise<Email[]> {
	const BASE_URL = "https://www.googleapis.com/gmail/v1/users/me";

	console.log("[fetchEmails] starting, accessToken present:", !!accessToken);

	if (!accessToken) {
		throw new Error("Missing Gmail access token");
	}

	// 1️⃣ Get message list
	const listRes = await fetch(`${BASE_URL}/messages?maxResults=10`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (listRes.status === 401) throw new Error("UNAUTHENTICATED");
	if (!listRes.ok) {
		throw new Error("Failed to fetch message list");
	}

	const listData = await listRes.json();

	if (!listData.messages) {
		return [];
	}

	// 2️⃣ Fetch metadata for each message
	const emails: Email[] = await Promise.all(
		listData.messages.map(async (msg: { id: string }, index: number) => {
			const msgRes = await fetch(
				`${BASE_URL}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (!msgRes.ok) {
				throw new Error(`Failed to fetch message ${msg.id}`);
			}

			const message = await msgRes.json();

			const headers = message.payload.headers;

			const getHeader = (name: string) =>
				headers.find((h: { name: string; value: string }) => h.name === name)
					?.value ?? "";

			return {
				id: index,
				from: getHeader("From"),
				subject: getHeader("Subject"),
				time: new Date(getHeader("Date")).toLocaleString(),
				unread: message.labelIds?.includes("UNREAD") ?? false,
			};
		}),
	);

	return emails;
}

const EVENT_COLORS: Record<string, string> = {
	"1": "#7986cb",
	"2": "#33b679",
	"3": "#8e24aa",
	"4": "#e67c73",
	"5": "#f6bf26",
	"6": "#f4511e",
	"7": "#039be5",
	"8": "#616161",
	"9": "#3f51b5",
	"10": "#0b8043",
	"11": "#d50000",
};

export async function fetchCalendarEvents(
	accessToken: string,
): Promise<CalendarEvent[]> {
	const BASE_URL = "https://www.googleapis.com/calendar/v3";
	console.log(
		"[fetchCalendarEvents] starting, accessToken present:",
		!!accessToken,
	);
	const now = new Date();
	const timeMin = now.toISOString();
	const endOfDay = new Date(now);
	endOfDay.setDate(endOfDay.getDate() + 7);
	const timeMax = endOfDay.toISOString();
	console.log("[fetchCalendarEvents] timeMin:", timeMin, "timeMax:", timeMax);

	const listRes = await fetch(`${BASE_URL}/users/me/calendarList`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	console.log(
		"[fetchCalendarEvents] calendarList response status:",
		listRes.status,
	);
	if (listRes.status === 401) throw new Error("UNAUTHENTICATED");
	if (!listRes.ok) {
		const body = await listRes.text();
		console.error("[fetchCalendarEvents] calendarList error body:", body);
		throw new Error("Failed to fetch calendar list");
	}
	const listData = await listRes.json();
	const calendars: { id: string; summary: string; primary?: boolean }[] =
		listData.items ?? [];
	console.log("[fetchCalendarEvents] calendars found:", calendars.length);

	const perCalendarEvents = await Promise.all(
		calendars.map((cal) =>
			fetchCalendarEventsForCal(cal, accessToken, BASE_URL, timeMin, timeMax),
		),
	);

	const events = perCalendarEvents.flat();
	console.log("[fetchCalendarEvents] total events:", events.length);
	return events.sort((a, b) => a.isoTime.localeCompare(b.isoTime));
}

async function fetchCalendarEventsForCal(
	calendar: { id: string; summary: string; primary?: boolean },
	accessToken: string,
	BASE_URL: string,
	timeMin: string,
	timeMax: string,
): Promise<CalendarEvent[]> {
	const url = new URL(
		`${BASE_URL}/calendars/${encodeURIComponent(calendar.id)}/events`,
	);
	url.search = new URLSearchParams({
		timeMin,
		timeMax,
		singleEvents: "true",
		orderBy: "startTime",
		maxResults: "20",
	}).toString();

	const res = await fetch(url.toString(), {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	console.log(
		"[fetchCalendarEvents] events response status:",
		res.status,
		"for calendar:",
		calendar.summary,
	);
	if (!res.ok) {
		const body = await res.text();
		console.error(
			"[fetchCalendarEvents] events error body:",
			body,
			"for calendar:",
			calendar.id,
		);
		return [];
	}
	const data = await res.json();
	const events: CalendarEvent[] = (data.items ?? []).map(
		(
			item: {
				id: string;
				summary?: string;
				start?: { dateTime?: string; date?: string };
				colorId?: string;
			},
			index: number,
		) => {
			const isoTime = item.start?.dateTime ?? item.start?.date ?? "";
			return {
				id: index,
				title: item.summary ?? "(No title)",
				isoTime,
				time: item.start?.dateTime
					? new Date(item.start.dateTime).toLocaleString()
					: (item.start?.date ?? ""),
				color: item.colorId
					? (EVENT_COLORS[item.colorId] ?? "#039be5")
					: "#039be5",
				calendarName: calendar.summary,
			} satisfies CalendarEvent;
		},
	);
	return events;
}

export interface WeatherData {
	temp: number;
	code: number;
}

function getCoords(): Promise<{ latitude: number; longitude: number }> {
	return new Promise((resolve, reject) =>
		navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve(coords),
			reject,
		),
	);
}

export async function fetchWeather(): Promise<WeatherData> {
	const { latitude, longitude } = await getCoords();
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.search = new URLSearchParams({
		latitude: String(latitude),
		longitude: String(longitude),
		current: "temperature_2m,weather_code",
		temperature_unit: "fahrenheit",
		timezone: "auto",
	}).toString();
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error("Failed to fetch weather");
	const data = await res.json();
	return {
		temp: Math.round(data.current.temperature_2m),
		code: data.current.weather_code,
	};
}

function GoogleDateToLocalDate(
	dueDate?: { year: number; month: number; day: number },
	dueTime?: { hours?: number; minutes?: number; seconds?: number },
): string | null {
	if (!dueDate) return null;

	const date = new Date(
		Date.UTC(
			dueDate.year,
			dueDate.month - 1, // JS months are 0-indexed
			dueDate.day,
			dueTime?.hours ?? 0,
			dueTime?.minutes ?? 0,
			dueTime?.seconds ?? 0,
		),
	);

	// Convert to user's local time automatically
	return date.toISOString();
}

export async function markTodoAsDone(todo: Todo, accessToken: string) {
	const BASE_URL = "https://tasks.googleapis.com/tasks/v1";
	console.log("[markTodoAsDone] check event recieved");
	const response = await fetch(
		`${BASE_URL}/lists/${todo.listId}/tasks/${todo.id}`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status: "completed",
			}),
		},
	);
	console.log("[markTodoAsDone] response recieved");
	if (!response.ok) {
		const body = await response.text();
		console.error("[markTodoAsDone] lists error body:", body);
		throw new Error("Failed to markTodoAsDone");
	}
}
