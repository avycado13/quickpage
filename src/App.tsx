import { useCallback, useState } from "react";
import "./App.css";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCard } from "@/components/CalendarCard";
import { ClassroomCard } from "@/components/ClassroomCard";
import { EmailCard } from "@/components/EmailCard";
import { Header } from "@/components/Header";
import { ScratchpadCard } from "@/components/ScratchpadCard";
import { SortableCard } from "@/components/SortableCard";
import { TodoCard } from "@/components/TodoCard";
import { mockEmails } from "@/data/mock";
import {
	type CardId,
	defaultCardOrder,
	type GoogleProfile,
	PROFILE_KEY,
	TOKEN_KEY,
} from "@/types";
import { fetchAssignments, fetchCalendarEvents, fetchTodos } from "./api";
import { BookmarkCard } from "./components/BookmarksCard";

function App() {
	const [visibleCards, setVisibleCards] = useState<Record<CardId, boolean>>(() => {
		const saved = localStorage.getItem("visible-cards");
		const defaults = Object.fromEntries(
			defaultCardOrder.map((id) => [id, true]),
		) as Record<CardId, boolean>;

		if (!saved) return defaults;

		try {
			return { ...defaults, ...JSON.parse(saved) };
		} catch {
			return defaults;
		}
	});

	const [profile, setProfile] = useState<GoogleProfile | null>(() => {
		const stored = localStorage.getItem(PROFILE_KEY);
		return stored ? JSON.parse(stored) : null;
	});

	const [accessToken, setAccessToken] = useState<string | null>(() =>
		localStorage.getItem(TOKEN_KEY),
	);
	const { data: todos = [] } = useQuery({
		queryKey: ["todos", accessToken],
		queryFn: () => fetchTodos(accessToken || ""),
		enabled: !!accessToken,
	});
	const { data: assignments = [] } = useQuery({
		queryKey: ["assignments", accessToken],
		queryFn: () => fetchAssignments(accessToken || ""),
		enabled: !!accessToken,
	});
	const { data: calendarEvents = [] } = useQuery({
		queryKey: ["calendarEvents", accessToken],
		queryFn: () => fetchCalendarEvents(accessToken || ""),
		enabled: !!accessToken,
	});

	const clearGoogleAuth = useCallback(() => {
		setProfile(null);
		setAccessToken(null);
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(PROFILE_KEY);
	}, []);

	const handleLoginSuccess = useCallback(
		async (tokenResponse: { access_token: string }) => {
			try {
				localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
				setAccessToken(tokenResponse.access_token);
				const res = await fetch(
					"https://www.googleapis.com/oauth2/v3/userinfo",
					{
						headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
					},
				);
				const userInfo: GoogleProfile = await res.json();
				localStorage.setItem(PROFILE_KEY, JSON.stringify(userInfo));
				setProfile(userInfo);
			} catch {
				console.log("Failed to fetch user info");
			}
		},
		[],
	);

	const login = useGoogleLogin({
		scope:
			"openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/calendar.readonly",
		onSuccess: handleLoginSuccess,
		onError: () => {
			console.log("Login Failed");
			toast("Login Failed", { description: "Please try again." });
		},
	});

	const [cardOrder, setCardOrder] = useState<CardId[]>(() => {
		const saved = localStorage.getItem("card-order");

		if (!saved) return [...defaultCardOrder];

		try {
			const parsed = JSON.parse(saved) as CardId[];
			const missing = defaultCardOrder.filter((id) => !parsed.includes(id));
			return [...parsed, ...missing];
		} catch {
			return [...defaultCardOrder];
		}
	});
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setCardOrder((prev) => {
				const oldIndex = prev.indexOf(active.id as CardId);
				const newIndex = prev.indexOf(over.id as CardId);
				const next = arrayMove(prev, oldIndex, newIndex);
				localStorage.setItem("card-order", JSON.stringify(next));
				return next;
			});
		}
	}

	function handleLogout() {
		clearGoogleAuth();
		googleLogout();
	}

	function handleVisibleCardsChange(nextVisibleCards: Record<CardId, boolean>) {
		setVisibleCards(nextVisibleCards);
		localStorage.setItem("visible-cards", JSON.stringify(nextVisibleCards));
	}

	const dashboardCards = cardOrder.filter((id) => visibleCards[id]);

	return (
		<div className="min-h-screen bg-background p-6 md:p-10">
			<Header
				profile={profile}
				onLogin={() => login()}
				onLogout={handleLogout}
				visibleCards={visibleCards}
				onVisibleCardsChange={handleVisibleCardsChange}
			/>

			{!profile ? (
				<div className="mx-auto max-w-2xl py-16 text-center">
					<h2 className="text-4xl font-bold tracking-tight mb-4">
						Your Google productivity dashboard
					</h2>
					<p className="text-lg text-muted-foreground mb-8">
						quickpage brings your Google Calendar, Tasks, Classroom assignments,
						and emails together in one customizable dashboard. Sign in with
						Google to get started — your data stays in your browser and is never
						stored on our servers.
					</p>
					<div className="grid gap-4 sm:grid-cols-2 text-left max-w-lg mx-auto text-sm text-muted-foreground">
						<div className="flex gap-2 items-start">
							<span className="text-lg">📅</span>
							<span>View upcoming calendar events at a glance</span>
						</div>
						<div className="flex gap-2 items-start">
							<span className="text-lg">✅</span>
							<span>Track your Google Tasks and to-dos</span>
						</div>
						<div className="flex gap-2 items-start">
							<span className="text-lg">📚</span>
							<span>See Google Classroom assignments and deadlines</span>
						</div>
						<div className="flex gap-2 items-start">
							<span className="text-lg">🔀</span>
							<span>Drag and drop to arrange cards your way</span>
						</div>
					</div>
				</div>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext items={dashboardCards} strategy={rectSortingStrategy}>
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
							{dashboardCards.map((id) => (
								<SortableCard key={id} id={id}>
									{id === "email" && <EmailCard emails={mockEmails} />}
									{id === "calendar" && (
										<CalendarCard events={calendarEvents} />
									)}
									{id === "todo" && (
										<TodoCard todosIn={todos} accessToken={accessToken ?? ""} />
									)}
									{id === "classroom" && (
										<ClassroomCard assignments={assignments} />
									)}
									{id === "scratchpad" && <ScratchpadCard />}

									{id === "bookmarks" && <BookmarkCard />}
								</SortableCard>
							))}
							{dashboardCards.length === 0 && (
								<div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
									All cards are hidden. Open Settings to show cards again.
								</div>
							)}
						</div>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
}

export default App;
