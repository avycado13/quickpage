import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent } from "@/types";

interface CalendarCardProps {
	events: CalendarEvent[];
}

export function CalendarCard({ events }: CalendarCardProps) {
	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<CalendarDays className="h-5 w-5 text-muted-foreground" />
				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Today</CardTitle>
						<CardDescription>{events.length} events</CardDescription>
					</div>
					<a href="https://calendar.google.com">
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-72">
					<div className="space-y-1 px-6 py-3">
						{events.map((event) => (
							<div
								key={event.id}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								<div
									className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${event.color}`}
								/>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">{event.title}</p>
									<p className="flex items-center gap-1 text-xs text-muted-foreground">
										<Clock className="h-3 w-3" />
										{event.time}
									</p>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</>
	);
}
