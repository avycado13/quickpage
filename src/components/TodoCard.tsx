import { ArrowUpRight, CheckSquare } from "lucide-react";
import { useState } from "react";
import { markTodoAsDone } from "@/api";
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
import { priorityColor, type Todo } from "@/types";

interface TodoCardProps {
	todosIn: Todo[];
	accessToken: string;
}

export function TodoCard({ todosIn, accessToken }: TodoCardProps) {
	const [todos, setTodos] = useState<Todo[]>(todosIn);
	const handleCheckedChange = async (todo: Todo, checked: boolean) => {
		setTodos((prev) =>
			prev.map((t) => (t.id === todo.id ? { ...t, done: checked } : t)),
		);
		if (checked) {
			await markTodoAsDone(todo, accessToken);
		}
	};

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<CheckSquare className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>To-do</CardTitle>
						<CardDescription>
							{todos.filter((todo) => !todo.done).length} remaining
						</CardDescription>
					</div>

					<a
						href="https://tasks.google.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<ScrollArea className="h-72">
					{todos.map((todo) => (
						<div key={todo.id}>
							<div className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50">
								<Checkbox
									checked={todo.done}
									onCheckedChange={() => handleCheckedChange(todo, true)}
								/>

								<span
									className={`flex-1 text-sm ${
										todo.done ? "line-through text-muted-foreground" : ""
									}`}
								>
									{todo.text}
								</span>

								<Badge variant={priorityColor[todo.priority]}>
									{todo.priority}
								</Badge>
							</div>

							<Separator />
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</>
	);
}
