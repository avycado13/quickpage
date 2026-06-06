import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import { useMemo } from "react";
import { fetchCalendarEvents } from "@/api";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent } from "@/types";
import { useAuth } from "./AuthProvider";
import { Separator } from "./ui/separator";

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

export function CalendarCard() {
	const { accessToken } = useAuth();
	const { data: events = [] } = useQuery({
		queryKey: ["calendarEvents", accessToken],
		queryFn: () => fetchCalendarEvents(accessToken || ""),
		enabled: !!accessToken,
	});
	/* sort events chronologically */

	const sortedEvents = useMemo(() => {
		return [...events].sort(
			(a, b) => new Date(a.isoTime).getTime() - new Date(b.isoTime).getTime(),
		);
	}, [events]);
	/* group events by day */
	const groupedEvents = useMemo(() => {
		return Object.groupBy(sortedEvents, (event) => getDayKey(event.isoTime));
	}, [sortedEvents]);

	/* convert to iterable array */
	const groupedEntries = useMemo(() => {
		return Object.entries(groupedEvents).filter(
			(entry): entry is [string, CalendarEvent[]] => Array.isArray(entry[1]),
		);
	}, [groupedEvents]);

	/* next upcoming event */
	const nextEvent = sortedEvents.find(
		(event) => new Date(event.isoTime).getTime() > Date.now(),
	);

	const nextEventText = nextEvent
		? (() => {
				const diffMs = new Date(nextEvent.time).getTime() - Date.now();

				const minutes = Math.floor(diffMs / 1000 / 60);

				if (minutes < 60) {
					return `${minutes}m`;
				}

				const hours = Math.floor(minutes / 60);
				const remainingMinutes = minutes % 60;

				return `${hours}h ${remainingMinutes}m`;
			})()
		: "No upcoming events";

	return (
		<>
			{/* HEADER */}
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-2">
					<CalendarDays className="h-5 w-5 text-muted-foreground" />

					<div>
						<CardTitle>Today</CardTitle>
						<CardDescription>{events.length} events</CardDescription>
					</div>
				</div>

				<a
					href="https://calendar.google.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
				</a>
			</CardHeader>

			{/* CONTENT */}
			<CardContent className="p-0">
				<div className="px-6 pb-2 text-sm text-muted-foreground">
					Next event in: {nextEventText}
				</div>

				<ScrollArea className="h-72">
					<div className="space-y-4 px-6 py-3">
						{groupedEntries.map(([dayKey, dayEvents]) => (
							<div key={dayKey} className="space-y-3">
								{/* DAY HEADER */}
								<div className="space-y-2">
									<div className="text-xs font-semibold text-muted-foreground">
										{formatDayLabel(dayEvents[0].isoTime)}
									</div>

									<Separator />
								</div>

								{/* EVENTS */}
								<div className="space-y-2">
									{dayEvents.map((event) => (
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
