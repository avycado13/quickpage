import { SearchIcon } from "lucide-react";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/unit-toggle";
import { Weather } from "@/components/Weather";
import type { CardId, GoogleProfile } from "@/types";
import { PROFILE_KEY, TOKEN_KEY } from "@/types";
import { Clock } from "./Clock";
import { SettingsDialog } from "./SettingsDialog";

interface HeaderProps {
	profile: GoogleProfile | null;
	onLogin: () => void;
	onLogout: () => void;
	visibleCards: Record<CardId, boolean>;
	onVisibleCardsChange: (visibleCards: Record<CardId, boolean>) => void;
	onOpenCommandMenu: () => void;
}

export const Header = React.memo(function Header({
	profile,
	onLogin,
	onLogout,
	visibleCards,
	onVisibleCardsChange,
	onOpenCommandMenu,
}: HeaderProps) {
	const handleLogout = useCallback(() => {
		localStorage.removeItem(PROFILE_KEY);
		localStorage.removeItem(TOKEN_KEY);

		onLogout();

		toast("Logged out", {
			description: "You have been logged out successfully.",
		});
	}, [onLogout]);
	return (
		<header className="mb-8 flex items-center justify-between">
			<div className="tabular-nums">
				<Clock />
			</div>{" "}
			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					className="gap-2 text-muted-foreground"
					onClick={onOpenCommandMenu}
				>
					<SearchIcon className="size-4" />
					<span className="hidden sm:inline">Search</span>
					<kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 text-xs sm:inline">
						⌘K
					</kbd>
				</Button>
				<div className="w-px h-4 bg-border" />
				<div className="w-32">
					<Weather />
				</div>{" "}
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
});
