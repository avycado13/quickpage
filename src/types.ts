export type Email = {
	id: number;
	threadId: string;
	googleId: string;
	labelIds: [string];
	from: string;
	subject: string;
	time: string;
	unread: boolean;
};

export type TodoPriority = "high" | "medium" | "low";

export type Todo = {
	id: string;
	text: string;
	done: boolean;
	priority: TodoPriority;
	webViewLink: string;
	listId: string;
	badge?: "destructive" | "secondary" | "outline";
};
export type TodoList = {
	id: string;
	title: string;
	todos: Todo[];
};

export type Assignment = {
	id: string;
	course: string;
	title: string;
	due: string;
	hasAttachment: boolean;
};

export type CalendarEvent = {
	id: string;
	title: string;
	time: string;
	isoTime: string;
	color: string;
	calendarName: string;
	hangoutLink?: string;
};

export type Birthday = {
	id: string;
	name: string;
	photoUrl?: string;
	month: number;
	day: number;
	year?: number;
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
	"bookmarks",
	"birthday",
	"quote",
] as const;
export type CardId = (typeof defaultCardOrder)[number];

export const cardLabels: Record<CardId, string> = {
	email: "Inbox",
	calendar: "Today",
	todo: "To-do",
	classroom: "Classroom",
	scratchpad: "Scratchpad",
	bookmarks: "Bookmarks",
	birthday: "Birthdays",
	quote: "Quote of the Day",
};

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
