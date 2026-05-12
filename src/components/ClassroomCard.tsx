import { ArrowUpRight, BookOpen, Clock, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Assignment } from "@/types";

interface ClassroomCardProps {
	assignments: Assignment[];
}

export function ClassroomCard({ assignments }: ClassroomCardProps) {
	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<BookOpen className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Classroom</CardTitle>
						<CardDescription>Upcoming assignments</CardDescription>
					</div>
					<a href="https://classroom.google.com">
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-72">
					{assignments
						.toSorted((a, b) => Date.parse(a.due) - Date.parse(b.due))
						.map((a) => (
							<div key={a.id}>
								<div className="flex items-start gap-3 px-6 py-3">
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="shrink-0">
												{a.course}
											</Badge>
											{a.hasAttachment && (
												<Paperclip className="h-3 w-3 text-muted-foreground" />
											)}
										</div>
										<p className="mt-1 text-sm font-medium">{a.title}</p>
										<p
											className={`flex items-center gap-1 text-xs ${
												new Date(a.due) < new Date()
													? "text-red-500"
													: "text-muted-foreground"
											}`}
										>
											<Clock className="h-3 w-3" />
											Due {new Date(a.due).toLocaleString()}
										</p>{" "}
									</div>
								</div>
								<Separator />
							</div>
						))}
				</ScrollArea>
			</CardContent>
		</>
	);
}
