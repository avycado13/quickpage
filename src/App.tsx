import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import "./App.css";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import {
	type CardId,
	defaultCardOrder,
	type GoogleProfile,
	PROFILE_KEY,
} from "@/types";

// Lazy-loaded so the dashboard (dnd-kit + all cards) is only fetched once the
// user is signed in. The logged-out landing page ships without it.
const Dashboard = lazy(() => import("@/components/Dashboard"));

function App() {
	const { setAccessToken } = useAuth();
	const [visibleCards, setVisibleCards] = useState<Record<CardId, boolean>>(
		() => {
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
		},
	);

	const [profile, setProfile] = useState<GoogleProfile | null>(() => {
		const stored = localStorage.getItem(PROFILE_KEY);
		return stored ? JSON.parse(stored) : null;
	});

	const clearGoogleAuth = useCallback(() => {
		setProfile(null);
		setAccessToken(null);
		localStorage.removeItem(PROFILE_KEY);
	}, [setAccessToken]);

	const handleLoginSuccess = useCallback(
		async (tokenResponse: { access_token: string }) => {
			try {
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
		[setAccessToken],
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

	const handleLogout = useCallback(() => {
		clearGoogleAuth();
		googleLogout();
	}, [clearGoogleAuth]);

	const queryClient = useQueryClient();

	useEffect(() => {
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			const error = event.query.state.error;
			if (error instanceof Error && error.message === "UNAUTHENTICATED") {
				handleLogout();
				toast("Session expired", {
					description: "Your Google session expired. Please sign in again.",
				});
			}
		});
		return unsubscribe;
	}, [queryClient, handleLogout]);

	const handleVisibleCardsChange = useCallback(
		(nextVisibleCards: Record<CardId, boolean>) => {
			setVisibleCards(nextVisibleCards);
			localStorage.setItem("visible-cards", JSON.stringify(nextVisibleCards));
		},
		[],
	);
	const handleLogin = useCallback(() => {
		login();
	}, [login]);

	return (
		<div className="min-h-screen bg-background p-6 md:p-10">
			<Header
				profile={profile}
				onLogin={handleLogin}
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
				<Suspense
					fallback={
						<div className="py-16 text-center text-muted-foreground">
							Loading dashboard…
						</div>
					}
				>
					<Dashboard visibleCards={visibleCards} />
				</Suspense>
			)}
		</div>
	);
}

export default App;
