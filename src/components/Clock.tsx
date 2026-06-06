import { useEffect, useState } from "react";

// Created once, reused on every tick instead of rebuilding a formatter each second.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "short",
	timeStyle: "medium",
});

function greetingFor(hours: number) {
	if (hours < 12) return "Good morning";
	if (hours < 18) return "Good afternoon";
	return "Good evening";
}

export function Clock() {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	const d = new Date(now);
	const greeting = greetingFor(d.getHours());
	const dateStr = dateFormatter.format(d);

	return (
		<div>
			<h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
			<p className="text-muted-foreground">{dateStr}</p>
		</div>
	);
}
