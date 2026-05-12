import { ArrowUpRight, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Todo } from "@/types";
import { priorityColor } from "@/types";

interface TodoCardProps {
	todos: Todo[];
}

export function TodoCard({ todos }: TodoCardProps) {
	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<CheckSquare className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>To-do</CardTitle>
						<CardDescription>
							{todos.filter((t) => !t.done).length} remaining
						</CardDescription>
					</div>
					<a href="https://tasks.google.com">
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-72">
					{todos.map((todo) => (
						<div key={todo.id}>
							<label className="flex cursor-pointer items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
								<Checkbox checked={todo.done} />
								<span
									className={`flex-1 text-sm ${todo.done ? "text-muted-foreground line-through" : ""}`}
								>
									{todo.text}
								</span>
								<Badge variant={priorityColor[todo.priority]}>
									{todo.priority}
								</Badge>
							</label>
							<Separator />
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</>
	);
}
