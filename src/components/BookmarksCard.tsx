import { Bookmark as BookmarkIcon, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

const STORAGE_KEY = "bookmarks";

interface Bookmark {
	url: string;
	name: string;
	faviconUrl: string;
}

export function BookmarkCard() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
		JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"),
	);
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [open, setOpen] = useState(false);

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const bookmarkUrl = new URL(url);
		const nextBookmarks = [
			...bookmarks,
			{
				url: bookmarkUrl.toString(),
				name: name.trim() || bookmarkUrl.hostname,
				faviconUrl: `https://www.google.com/s2/favicons?domain=${bookmarkUrl.hostname}&sz=64`,
			},
		];

		setBookmarks(nextBookmarks);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookmarks));
		setName("");
		setUrl("");
		setOpen(false);
	};
	const deleteBookmark = (bookmark: Bookmark) => {
		const next = bookmarks.filter((item) => item !== bookmark);
		setBookmarks(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	};

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<BookmarkIcon className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Bookmarks</CardTitle>
					</div>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="icon-xs" variant="ghost">
							<Plus />
							<span className="sr-only">Add bookmark</span>
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<form className="space-y-3" onSubmit={handleSubmit}>
							<Input
								className="w-full border p-2"
								placeholder="Name"
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
							<Input
								className="w-full border p-2"
								placeholder="https://example.com"
								type="url"
								value={url}
								onChange={(event) => setUrl(event.target.value)}
								required
							/>
							<Button>Save</Button>
						</form>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{bookmarks.map((bookmark) => (
						<div className="group relative" key={bookmark.url}>
							<Button asChild size="icon" variant="secondary">
								<a
									href={bookmark.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									<img
										alt={bookmark.name}
										className="h-5 w-5"
										src={bookmark.faviconUrl}
									/>
								</a>
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="icon"
										variant="ghost"
										className="absolute -top-2 -right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent>
									<DropdownMenuItem>
										<button
											type="button"
											onClick={() => deleteBookmark(bookmark)}
										>
											Delete
										</button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
				</div>
			</CardContent>
		</>
	);
}
