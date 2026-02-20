import { useEffect, useState, useCallback } from "react";
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

function App() {
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

	const silentLogin = useGoogleLogin({
		scope:
			"openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/calendar.readonly",
		prompt: "",
		onSuccess: handleLoginSuccess,
		onError: () => {
			setAccessToken(null);
			setProfile(null);
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(PROFILE_KEY);
		},
	});

	useEffect(() => {
		if (!accessToken) return;
		fetch(
			`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
		)
			.then((res) => {
				if (!res.ok) {
					silentLogin();
				}
			})
			.catch(() => {
				silentLogin();
			});
	}, []);

	const [cardOrder, setCardOrder] = useState<CardId[]>([...defaultCardOrder]);

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
				return arrayMove(prev, oldIndex, newIndex);
			});
		}
	}

	function handleLogout() {
		setProfile(null);
		setAccessToken(null);
		googleLogout();

	}

	return (
		<div className="min-h-screen bg-background p-6 md:p-10">
			<Header
				profile={profile}
				onLogin={() => login()}
				onLogout={handleLogout}
			/>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={cardOrder} strategy={rectSortingStrategy}>
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
						{cardOrder.map((id) => (
							<SortableCard key={id} id={id}>
								{id === "email" && <EmailCard emails={mockEmails} />}
								{id === "calendar" && <CalendarCard events={calendarEvents} />}
								{id === "todo" && <TodoCard todos={todos} />}
								{id === "classroom" && (
									<ClassroomCard assignments={assignments} />
								)}
							</SortableCard>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default App;
