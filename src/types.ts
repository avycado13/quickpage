export type Email = {
	id: number;
	from: string;
	subject: string;
	time: string;
	unread: boolean;
};

export type TodoPriority = "high" | "medium" | "low";

export type Todo = {
	id: number;
	text: string;
	done: boolean;
	priority: TodoPriority;
};
export type TodoList = {
	id: number;
	title: string;
	todos: Todo[];
};

export type Assignment = {
	id: number;
	course: string;
	title: string;
	due: string;
	hasAttachment: boolean;
};

export type CalendarEvent = {
	id: number;
	title: string;
	time: string;
	color: string;
};

export interface GoogleProfile {
	name?: string;
	picture?: string;
	email?: string;
}

export const defaultCardOrder = [
	"email",
	"calendar",
	"todo",
	"classroom",
	"scratchpad",
] as const;
export type CardId = (typeof defaultCardOrder)[number];

export const priorityColor: Record<
	TodoPriority,
	"destructive" | "secondary" | "outline"
> = {
	high: "destructive",
	medium: "secondary",
	low: "outline",
};

export const PROFILE_KEY = "google_profile";
export const TOKEN_KEY = "google_access_token";
