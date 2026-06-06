import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/unit-toggle";
import { Weather } from "@/components/Weather";
import type { CardId, GoogleProfile } from "@/types";
import { PROFILE_KEY, TOKEN_KEY } from "@/types";
import { SettingsDialog } from "./SettingsDialog";

interface HeaderProps {
	profile: GoogleProfile | null;
	onLogin: () => void;
	onLogout: () => void;
	visibleCards: Record<CardId, boolean>;
	onVisibleCardsChange: (visibleCards: Record<CardId, boolean>) => void;
}

export function Header({
	profile,
	onLogin,
	onLogout,
	visibleCards,
	onVisibleCardsChange,
}: HeaderProps) {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		// Set up an interval to update the state every second
		const timer = setInterval(() => {
			setNow(new Date());
		}, 1000);

		// Clean up the interval on component unmount to prevent memory leaks
		return () => clearInterval(timer);
	}, []);

	const greeting =
		now.getHours() < 12
			? "Good morning"
			: now.getHours() < 18
				? "Good afternoon"
				: "Good evening";
	const dateStr = now.toLocaleString("en-US");
	const handleLogout = () => {
		localStorage.removeItem(PROFILE_KEY);
		localStorage.removeItem(TOKEN_KEY);
		onLogout();
		toast("Logged out", {
			description: "You have been logged out successfully.",
		});
	};

	return (
		<header className="mb-8 flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
				<p className="text-muted-foreground">{dateStr}</p>
			</div>
			<div className="flex items-center gap-4">
				<Weather />
				<div className="w-px h-4 bg-border" />
				<UnitToggle />
				<div className="w-px h-4 bg-border" />
				<ModeToggle />
				<SettingsDialog
					visibleCards={visibleCards}
					onVisibleCardsChange={onVisibleCardsChange}
				/>
				{profile ? (
					<Avatar className="cursor-pointer" onClick={handleLogout}>
						<AvatarImage
							src={profile.picture}
							alt={profile.name}
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>{profile.name?.[0] ?? "U"}</AvatarFallback>
					</Avatar>
				) : (
					<Button variant="outline" onClick={onLogin}>
						Sign in with Google
					</Button>
				)}
			</div>
		</header>
	);
}
