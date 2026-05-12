import type { Assignment, CalendarEvent, Email, Todo } from "../types";

// export const mockEmails: Email[] = [
// 	{
// 		id: 1,
// 		from: "Prof. Johnson",
// 		subject: "Midterm grades posted",
// 		time: "10:32 AM",
// 		unread: true,
// 	},
// 	{
// 		id: 2,
// 		from: "Study Group",
// 		subject: "Meeting tomorrow at 3pm",
// 		time: "9:15 AM",
// 		unread: true,
// 	},
// 	{
// 		id: 3,
// 		from: "Canvas",
// 		subject: "New announcement in CS 301",
// 		time: "Yesterday",
// 		unread: false,
// 	},
// 	{
// 		id: 4,
// 		from: "Library",
// 		subject: "Your hold is ready for pickup",
// 		time: "Yesterday",
// 		unread: false,
// 	},
// 	{
// 		id: 5,
// 		from: "Financial Aid",
// 		subject: "Action required: verify enrollment",
// 		time: "Mon",
// 		unread: false,
// 	},
// ];
export const mockEmails: Email[] = [
	{
		id: 1,
		from: "QuickPage",
		subject: "Email widget does not work at the moment",
		time: "10:32 AM",
		unread: true,
	},
];

export const mockTodos: Todo[] = [
	{ id: 1, text: "Finish lab report", done: false, priority: "high" },
	{ id: 2, text: "Read chapters 5-7", done: false, priority: "medium" },
	{ id: 3, text: "Submit scholarship app", done: false, priority: "high" },
	{ id: 4, text: "Buy groceries", done: true, priority: "low" },
	{ id: 5, text: "Email advisor", done: true, priority: "medium" },
];

export const mockAssignments: Assignment[] = [
	{
		id: 1,
		course: "CS 301",
		title: "Algorithm Analysis HW4",
		due: "Tomorrow, 11:59 PM",
		hasAttachment: true,
	},
	{
		id: 2,
		course: "MATH 250",
		title: "Problem Set 6",
		due: "Thu, 11:59 PM",
		hasAttachment: false,
	},
	{
		id: 3,
		course: "ENG 102",
		title: "Essay Draft 2",
		due: "Fri, 5:00 PM",
		hasAttachment: true,
	},
	{
		id: 4,
		course: "CS 301",
		title: "Lab 5: Graph Traversal",
		due: "Next Mon",
		hasAttachment: true,
	},
];

export const mockCalendar: CalendarEvent[] = [
	{
		id: 1,
		title: "CS 301 Lecture",
		time: "9:00 – 10:15 AM",
		color: "bg-blue-500",
	},
	{
		id: 2,
		title: "Office Hours w/ Prof. Johnson",
		time: "11:00 AM – 12:00 PM",
		color: "bg-emerald-500",
	},
	{
		id: 3,
		title: "Study Group",
		time: "3:00 – 4:30 PM",
		color: "bg-violet-500",
	},
	{
		id: 4,
		title: "MATH 250 Lecture",
		time: "5:00 – 6:15 PM",
		color: "bg-amber-500",
	},
];
