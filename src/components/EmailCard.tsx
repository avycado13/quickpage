import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Mail } from "lucide-react";
import { fetchEmails } from "@/api";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "./AuthProvider";

export function EmailCard() {
	const { accessToken } = useAuth();
	const { data: emails = [] } = useQuery({
		queryKey: ["emails", accessToken],
		queryFn: () => fetchEmails(accessToken || ""),
		enabled: !!accessToken,
	});

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<Mail className="h-5 w-5 text-muted-foreground" />

				<div className="flex items-center gap-2">
					<div>
						<CardTitle>Inbox</CardTitle>
						<CardDescription>
							{emails.filter((e) => e.unread).length} unread
						</CardDescription>
					</div>
					<a
						href="https://mail.google.com"
						target="_blank"
						rel="noopener noreferrer"
						className="ml-auto"
					>
						<ArrowUpRight className="h-5 w-5 text-muted-foreground" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-72">
					{emails.map((email) => (
						<div key={email.id}>
							<button
								type="button"
								className="flex w-full items-start gap-3 px-6 py-3 text-left hover:bg-muted/50 transition-colors"
							>
								{email.unread && (
									<span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
								)}
								<div
									className={`min-w-0 flex-1 ${!email.unread ? "ml-5" : ""}`}
								>
									<p
										className={`truncate text-sm ${email.unread ? "font-semibold" : ""}`}
									>
										{email.from}
									</p>
									<p className="truncate text-sm text-muted-foreground">
										{email.subject}
									</p>
								</div>
								<span className="shrink-0 text-xs text-muted-foreground">
									{email.time}
								</span>
							</button>
							<Separator />
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</>
	);
}
