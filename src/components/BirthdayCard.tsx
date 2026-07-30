import { useQuery } from "@tanstack/react-query";
import { Cake } from "lucide-react";
import { useMemo } from "react";
import { fetchBirthdays } from "@/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Birthday } from "@/types";
import { useAuth } from "./AuthProvider";

function nextOccurrence(birthday: Birthday, from: Date): Date {
	const year = from.getFullYear();
	let next = new Date(year, birthday.month - 1, birthday.day);
	if (next < from) {
		next = new Date(year + 1, birthday.month - 1, birthday.day);
	}
	return next;
}

function daysUntilLabel(target: Date, from: Date): string {
	const startOfFrom = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	const diffDays = Math.round(
		(target.getTime() - startOfFrom.getTime()) / (1000 * 60 * 60 * 24),
	);
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	return `In ${diffDays} days`;
}

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function BirthdayCard() {
	const { accessToken } = useAuth();
	const { data: birthdays = [] } = useQuery({
		queryKey: ["birthdays", accessToken],
		queryFn: () => fetchBirthdays(accessToken || ""),
		enabled: !!accessToken,
	});

	const upcoming = useMemo(() => {
		const now = new Date();
		return birthdays
			.map((birthday) => ({ birthday, next: nextOccurrence(birthday, now) }))
			.sort((a, b) => a.next.getTime() - b.next.getTime())
			.slice(0, 3);
	}, [birthdays]);

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<Cake className="h-5 w-5 text-muted-foreground" />
				<div>
					<CardTitle>Birthdays</CardTitle>
					<CardDescription>Next {upcoming.length} coming up</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="space-y-2 px-6 py-3">
					{upcoming.length === 0 && (
						<p className="text-sm text-muted-foreground">
							No upcoming birthdays
						</p>
					)}

					{upcoming.map(({ birthday, next }, index) => (
						<div key={birthday.id}>
							<div className="flex items-center gap-3 py-2">
								<Avatar className="h-9 w-9">
									<AvatarImage src={birthday.photoUrl} alt={birthday.name} />
									<AvatarFallback>{initials(birthday.name)}</AvatarFallback>
								</Avatar>

								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{birthday.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{next.toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})}
									</p>
								</div>

								<span className="shrink-0 text-xs text-muted-foreground">
									{daysUntilLabel(next, new Date())}
								</span>
							</div>

							{index < upcoming.length - 1 && <Separator />}
						</div>
					))}
				</div>
			</CardContent>
		</>
	);
}
