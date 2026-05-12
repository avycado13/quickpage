import { ArrowUpRight, NotebookPen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "scratchpad_content";

export function ScratchpadCard() {
	const [text, setText] = useState(
		() => localStorage.getItem(STORAGE_KEY) ?? "",
	);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, text);
	}, [text]);

	const handleClear = () => {
		setText(""); // This clears the textarea
	};

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<NotebookPen className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Scratchpad</CardTitle>
						<CardDescription>Quick notes</CardDescription>
					</div>
					<button type="reset" onClick={handleClear}>
						<Trash className="h-5 w-5 text-muted-foreground" />
					</button>
					<a href="https://docs.new">
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>
			<CardContent>
				<Textarea
					className="h-60 resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
					id="scratchpad-area"
					placeholder="Type something..."
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</CardContent>
		</>
	);
}
