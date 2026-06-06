import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckSquare } from "lucide-react";
import { useMemo } from "react";
import { fetchTodos, markTodoAsDone } from "@/api";
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
import { useAuth } from "./AuthProvider";

export function TodoCard() {
	const { accessToken } = useAuth();
	const { data: todos = [] } = useQuery({
		queryKey: ["todos", accessToken],
		queryFn: () => fetchTodos(accessToken || ""),
		enabled: !!accessToken,
	});
	const queryClient = useQueryClient();

	const markDoneMutation = useMutation({
		mutationFn: (todo: Todo) => markTodoAsDone(todo, accessToken || ""),

		onMutate: async (todo) => {
			queryClient.setQueryData<Todo[]>(["todos", accessToken], (old = []) =>
				old.map((t) => (t.id === todo.id ? { ...t, done: true } : t)),
			);
		},

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["todos", accessToken],
			});
		},
	});
	const remainingCount = useMemo(
		() => todos.filter((todo) => !todo.done).length,
		[todos],
	);

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<CheckSquare className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>To-do</CardTitle>
						<CardDescription>{remainingCount} remaining</CardDescription>
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
									onCheckedChange={() => markDoneMutation.mutate(todo)}
								/>

								<span
									className={`flex-1 text-sm ${
										todo.done ? "line-through text-muted-foreground" : ""
									}`}
								>
									{todo.text}
								</span>

								<Badge variant={todo.badge}>{todo.priority}</Badge>
							</div>

							<Separator />
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</>
	);
}
