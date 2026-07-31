import { useQuery } from "@tanstack/react-query";
import { Quote as QuoteIcon, RefreshCw } from "lucide-react";
import { fetchQuote } from "@/api";
import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function QuoteCard() {
	const { data, isError, isFetching, refetch } = useQuery({
		queryKey: ["quote"],
		queryFn: fetchQuote,
		staleTime: 60 * 60 * 1000,
		retry: 1,
	});

	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<QuoteIcon className="h-5 w-5 text-muted-foreground" />
				<div className="flex-1">
					<CardTitle>Quote of the Day</CardTitle>
					<CardDescription>A little inspiration</CardDescription>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => refetch()}
					disabled={isFetching}
					aria-label="New quote"
				>
					<RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
				</Button>
			</CardHeader>

			<CardContent className="px-6 py-3">
				{isError && (
					<p className="text-sm text-muted-foreground">
						Couldn't load a quote right now.
					</p>
				)}

				{!isError && data && (
					<blockquote className="space-y-2">
						<p className="text-sm italic">"{data.text}"</p>
						<footer className="text-xs text-muted-foreground">
							— {data.author}
						</footer>
					</blockquote>
				)}
			</CardContent>
		</>
	);
}
