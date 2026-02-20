import type { Assignment, CalendarEvent, Todo, TodoPriority } from "./types";

export async function fetchTodos(accessToken: string): Promise<Todo[]> {
	const BASE_URL = "https://tasks.googleapis.com";
	console.log("[fetchTodos] starting, accessToken present:", !!accessToken);
	const lists = await fetch(`${BASE_URL}/tasks/v1/users/@me/lists`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	console.log("[fetchTodos] lists response status:", lists.status);
	if (!lists.ok) {
		const body = await lists.text();
		console.error("[fetchTodos] lists error body:", body);
		throw new Error("Failed to fetch lists");
	}
	const listsData = await lists.json();
	console.log("[fetchTodos] listsData:", listsData);
	const list = listsData.items[0];
	console.log("[fetchTodos] selected list:", list);
	const response = await fetch(
		`${BASE_URL}/tasks/v1/lists/${list.id}/tasks?showCompleted=false`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);
	console.log("[fetchTodos] tasks response status:", response.status);
	if (!response.ok) {
		const body = await response.text();
		console.error("[fetchTodos] tasks error body:", body);
		throw new Error("Failed to fetch todos");
	}
	const data = await response.json();
	console.log("[fetchTodos] raw tasks data:", data);
	const todos = (data.items ?? []).map(
		(item: { id: string; title: string; completed?: string }) => ({
			id: item.id,
			text: item.title,
			done: !!item.completed,
			priority: "medium" as TodoPriority,
		}),
	);
	console.log("[fetchTodos] mapped todos:", todos);
	return todos;
}

export async function fetchAssignments(
	accessToken: string,
): Promise<Assignment[]> {
	const BASE_URL = "https://classroom.googleapis.com";
	console.log("[fetchAssignments] starting, accessToken present:", !!accessToken);
	const coursesUrl = new URL("/v1/courses", BASE_URL);
	const coursesParams = new URLSearchParams({ studentId: "me" });
	coursesParams.append("courseStates", "ACTIVE");
	coursesParams.append("courseStates", "PROVISIONED");
	coursesUrl.search = coursesParams.toString();
	console.log("[fetchAssignments] fetching courses from:", coursesUrl.toString());

	const coursesRes = await fetch(coursesUrl.toString(), {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	console.log("[fetchAssignments] courses response status:", coursesRes.status);
	if (!coursesRes.ok) {
		const body = await coursesRes.text();
		console.error("[fetchAssignments] courses error body:", body);
		throw new Error("Failed to fetch courses");
	}
	const coursesData = await coursesRes.json();
	console.log("[fetchAssignments] coursesData:", coursesData);
	const courses = coursesData.courses;
	console.log("[fetchAssignments] courses:", courses);
	const assignments: Assignment[] = [];
	for (const course of courses) {
		console.log("[fetchAssignments] fetching courseWork for course:", course.id, course.name);
		const assignmentsUrl = new URL(
			`/v1/courses/${course.id}/courseWork`,
			BASE_URL,
		);
		assignmentsUrl.search = new URLSearchParams({
			orderBy: "dueDate asc",
			pageSize: Number(10).toString(),
		}).toString();
		console.log("[fetchAssignments] courseWork URL:", assignmentsUrl.toString());
		const assignmentsRes = await fetch(assignmentsUrl.toString(), {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		console.log("[fetchAssignments] courseWork response status:", assignmentsRes.status, "for course:", course.id);
		if (!assignmentsRes.ok) {
			const body = await assignmentsRes.text();
			console.error("[fetchAssignments] courseWork error body:", body, "for course:", course.id);
			throw new Error("Failed to fetch assignments");
		}
		const assignmentsData = await assignmentsRes.json();
		console.log("[fetchAssignments] raw courseWork data for course", course.id, ":", assignmentsData);
		const courseAssignments = assignmentsData.courseWork;
		console.log("[fetchAssignments] courseAssignments count:", courseAssignments?.length ?? 0);
		for (const assignment of courseAssignments) {
			assignments.push({
				id: assignment.id,
				course: course.name,
				title: assignment.title,
				due:
					GoogleDateToLocalDate(assignment.dueDate, assignment.dueTime) || "",
				hasAttachment: false,
			});
		}
	}
	console.log("[fetchAssignments] total assignments:", assignments.length, assignments);
	return assignments;
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
	console.log("[fetchCalendarEvents] starting, accessToken present:", !!accessToken);
	const now = new Date();
	const timeMin = now.toISOString();
	const endOfDay = new Date(now);
	endOfDay.setDate(endOfDay.getDate() + 7);
	const timeMax = endOfDay.toISOString();
	console.log("[fetchCalendarEvents] timeMin:", timeMin, "timeMax:", timeMax);

	const url = new URL(`${BASE_URL}/calendars/primary/events`);
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
	console.log("[fetchCalendarEvents] response status:", res.status);
	if (!res.ok) {
		const body = await res.text();
		console.error("[fetchCalendarEvents] error body:", body);
		throw new Error("Failed to fetch calendar events");
	}
	const data = await res.json();
	console.log("[fetchCalendarEvents] raw data:", data);
	const events = (data.items ?? []).map(
		(
			item: {
				id: string;
				summary?: string;
				start?: { dateTime?: string; date?: string };
				colorId?: string;
			},
			index: number,
		) => ({
			id: index,
			title: item.summary ?? "(No title)",
			time: item.start?.dateTime
				? new Date(item.start.dateTime).toLocaleString()
				: item.start?.date ?? "",
			color: item.colorId ? (EVENT_COLORS[item.colorId] ?? "#039be5") : "#039be5",
		}),
	);
	console.log("[fetchCalendarEvents] mapped events:", events);
	return events;
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
	return date.toLocaleString();
}
