import {
	Bookmark as BookmarkIcon,
	CornerDownRight,
	Laptop,
	LayoutGrid,
	LogIn,
	LogOut,
	Moon,
	Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	type CardId,
	cardLabels,
	defaultCardOrder,
	type GoogleProfile,
} from "@/types";

const BOOKMARKS_KEY = "bookmarks";

interface Bookmark {
	url: string;
	name: string;
	faviconUrl: string;
}

interface CommandMenuProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: GoogleProfile | null;
	visibleCards: Record<CardId, boolean>;
	onVisibleCardsChange: (visibleCards: Record<CardId, boolean>) => void;
	onLogin: () => void;
	onLogout: () => void;
}

export function CommandMenu({
	open,
	onOpenChange,
	profile,
	visibleCards,
	onVisibleCardsChange,
	onLogin,
	onLogout,
}: CommandMenuProps) {
	const { setTheme } = useTheme();
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				onOpenChange(!open);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onOpenChange]);

	// Bookmarks live in localStorage, owned by BookmarksCard, so re-read on
	// every open instead of subscribing to keep this in sync with edits.
	useEffect(() => {
		if (!open) return;
		try {
			setBookmarks(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? "[]"));
		} catch {
			setBookmarks([]);
		}
	}, [open]);

	function toggleCard(cardId: CardId) {
		onVisibleCardsChange({ ...visibleCards, [cardId]: !visibleCards[cardId] });
		onOpenChange(false);
	}

	function jumpToCard(cardId: CardId) {
		onOpenChange(false);
		requestAnimationFrame(() => {
			document
				.getElementById(`card-${cardId}`)
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	}

	function runTheme(theme: "light" | "dark" | "system") {
		setTheme(theme);
		onOpenChange(false);
	}

	const visibleCardIds = defaultCardOrder.filter((id) => visibleCards[id]);

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput placeholder="Type a command or search…" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{profile && visibleCardIds.length > 0 && (
					<>
						<CommandGroup heading="Jump to card">
							{visibleCardIds.map((cardId) => (
								<CommandItem key={cardId} onSelect={() => jumpToCard(cardId)}>
									<CornerDownRight />
									<span>{cardLabels[cardId]}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
					</>
				)}
				{profile && bookmarks.length > 0 && (
					<>
						<CommandGroup heading="Bookmarks">
							{bookmarks.map((bookmark) => (
								<CommandItem
									key={bookmark.url}
									value={`bookmark ${bookmark.name} ${bookmark.url}`}
									onSelect={() => {
										window.open(bookmark.url, "_blank", "noopener,noreferrer");
										onOpenChange(false);
									}}
								>
									<BookmarkIcon />
									<span>{bookmark.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
					</>
				)}
				{profile && (
					<>
						<CommandGroup heading="Cards">
							{defaultCardOrder.map((cardId) => (
								<CommandItem key={cardId} onSelect={() => toggleCard(cardId)}>
									<LayoutGrid />
									<span>
										{visibleCards[cardId] ? "Hide" : "Show"} {cardLabels[cardId]}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
					</>
				)}
				<CommandGroup heading="Theme">
					<CommandItem onSelect={() => runTheme("light")}>
						<Sun />
						<span>Light</span>
					</CommandItem>
					<CommandItem onSelect={() => runTheme("dark")}>
						<Moon />
						<span>Dark</span>
					</CommandItem>
					<CommandItem onSelect={() => runTheme("system")}>
						<Laptop />
						<span>System</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Account">
					{profile ? (
						<CommandItem
							onSelect={() => {
								onLogout();
								onOpenChange(false);
							}}
						>
							<LogOut />
							<span>Sign out</span>
						</CommandItem>
					) : (
						<CommandItem
							onSelect={() => {
								onLogin();
								onOpenChange(false);
							}}
						>
							<LogIn />
							<span>Sign in with Google</span>
						</CommandItem>
					)}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
