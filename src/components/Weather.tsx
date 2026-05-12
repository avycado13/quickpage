import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react";
import { fetchWeather } from "@/api";

function weatherInfo(code: number): { label: string; Icon: React.ElementType } {
	if (code === 0) return { label: "Clear", Icon: Sun };
	if (code <= 3) return { label: "Cloudy", Icon: Cloud };
	if (code <= 48) return { label: "Foggy", Icon: Cloud };
	if (code <= 55) return { label: "Drizzle", Icon: CloudRain };
	if (code <= 67) return { label: "Rain", Icon: CloudRain };
	if (code <= 77) return { label: "Snow", Icon: CloudSnow };
	if (code <= 82) return { label: "Showers", Icon: CloudRain };
	return { label: "Storm", Icon: CloudLightning };
}

export function Weather() {
	const { data, isError } = useQuery({
		queryKey: ["weather"],
		queryFn: fetchWeather,
		staleTime: 10 * 60 * 1000,
		retry: 1,
	});

	if (!data || isError) return null;

	const { label, Icon } = weatherInfo(data.code);

	return (
		<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
			<Icon className="h-4 w-4" />
			<span>{data.temp}°F</span>
			<span className="hidden sm:inline">· {label}</span>
		</div>
	);
}
