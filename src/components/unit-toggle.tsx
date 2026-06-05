import { Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnit } from "@/components/unit-context";

export function UnitToggle() {
	const { unit, setUnit } = useUnit();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<Cloud className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Toggle temperature unit</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setUnit("F")} disabled={unit === "F"}>
					Fahrenheit (°F)
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setUnit("C")} disabled={unit === "C"}>
					Celsius (°C)
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
