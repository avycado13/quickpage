import { createContext, useContext, useEffect, useState } from "react";

export type TemperatureUnit = "F" | "C";

interface UnitContextType {
	unit: TemperatureUnit;
	setUnit: (unit: TemperatureUnit) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
	const [unit, setUnit] = useState<TemperatureUnit>(() => {
		const stored = localStorage.getItem("temperature-unit");
		return (stored as TemperatureUnit) || "F";
	});

	useEffect(() => {
		localStorage.setItem("temperature-unit", unit);
	}, [unit]);

	return (
		<UnitContext.Provider value={{ unit, setUnit }}>
			{children}
		</UnitContext.Provider>
	);
}

export function useUnit() {
	const context = useContext(UnitContext);
	if (!context) {
		throw new Error("useUnit must be used within UnitProvider");
	}
	return context;
}
