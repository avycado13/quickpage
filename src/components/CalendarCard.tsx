import { ArrowUpRight, CalendarDays, Clock, SquarePen } from "lucide-react";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent } from "@/types";
import { Separator } from "./ui/separator";

interface CalendarCardProps {
	events: CalendarEvent[];
}

function formatDayLabel(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
}

function getDayKey(iso: string) {
	return new Date(iso).toDateString();
}

export function CalendarCard({ events }: CalendarCardProps) {
	/* sort events chronologically */
	const sortedEvents = [...events].sort(
		(a, b) => new Date(a.isoTime).getTime() - new Date(b.isoTime).getTime(),
	);

	/* group events by day */
	const groupedEvents = Object.groupBy(sortedEvents, (event) =>
		getDayKey(event.isoTime),
	);

	return (
		<>
			{/* HEADER */}
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<CalendarDays className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Today</CardTitle>
						<CardDescription>{events.length} events</CardDescription>
					</div>

					<a
						href="https://calendar.google.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>

			{/* CONTENT */}
			<CardContent className="p-0">
				<ScrollArea className="h-72">
					<div className="px-6 py-3 space-y-4">
						{Object.entries(groupedEvents).map(([dayKey, dayEvents]) => (
							<div key={dayKey}>
								{/* DAY SEPARATOR */}
								<div className="mb-2 text-xs font-semibold text-muted-foreground">
									{formatDayLabel(dayEvents![0].time)}
								</div>{" "}
								<Separator />
								<div className="space-y-1">
									{dayEvents!.map((event) => (
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
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</>
	);
}
