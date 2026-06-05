import { Bookmark as BookmarkIcon, Github, Plus } from "lucide-react";
import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";

const STORAGE_KEY = "bookmarks";

interface Bookmark {
	url: URL;
	name: string;
	faviconUrl: URL;
}

export function BookmarkCard() {
	const [_bookmarks, _setBookmarks] = useState<Bookmark[]>(() =>
		JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"),
	);
	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<BookmarkIcon className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Bookmarks</CardTitle>
					</div>
				</div>
				<Plus />
			</CardHeader>
			<CardContent>
				<Button size="icon" variant="secondary">
					{" "}
					<Github className="h-5 w-5" />
				</Button>
			</CardContent>
		</>
	);
}
