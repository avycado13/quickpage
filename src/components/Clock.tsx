import { useEffect, useMemo, useState } from "react";

export function Clock() {
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	const { greeting, dateStr } = useMemo(() => {
		const d = new Date(now);

		return {
			greeting:
				d.getHours() < 12
					? "Good morning"
					: d.getHours() < 18
						? "Good afternoon"
						: "Good evening",

			dateStr: d.toLocaleString("en-US"),
		};
	}, [now]);
	return (
		<div>
			<h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
			<p className="text-muted-foreground">{dateStr}</p>
		</div>
	);
}
