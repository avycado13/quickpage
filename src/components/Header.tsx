import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { GoogleProfile } from "@/types";
import { PROFILE_KEY, TOKEN_KEY } from "@/types";

interface HeaderProps {
	profile: GoogleProfile | null;
	onLogin: () => void;
	onLogout: () => void;
}

export function Header({
	profile,
	onLogin,
	onLogout,
}: HeaderProps) {
	const today = new Date();
	const greeting =
		today.getHours() < 12
			? "Good morning"
			: today.getHours() < 18
				? "Good afternoon"
				: "Good evening";
	const dateStr = today.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

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
		</header>
	);
}
