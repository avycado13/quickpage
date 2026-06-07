import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { CalendarCard } from "@/components/CalendarCard";
import { ClassroomCard } from "@/components/ClassroomCard";
import { EmailCard } from "@/components/EmailCard";
import { ScratchpadCard } from "@/components/ScratchpadCard";
import { SortableCard } from "@/components/SortableCard";
import { TodoCard } from "@/components/TodoCard";
import { type CardId, defaultCardOrder } from "@/types";
import { BookmarkCard } from "./BookmarksCard";

interface DashboardProps {
	visibleCards: Record<CardId, boolean>;
}

export default function Dashboard({ visibleCards }: DashboardProps) {
	const [cardOrder, setCardOrder] = useState<CardId[]>(() => {
		const saved = localStorage.getItem("card-order");

		if (!saved) return [...defaultCardOrder];

		try {
			const parsed = JSON.parse(saved) as CardId[];
			const missing = defaultCardOrder.filter((id) => !parsed.includes(id));
			return [...parsed, ...missing];
		} catch {
			return [...defaultCardOrder];
		}
	});

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setCardOrder((prev) => {
				const oldIndex = prev.indexOf(active.id as CardId);
				const newIndex = prev.indexOf(over.id as CardId);
				const next = arrayMove(prev, oldIndex, newIndex);
				localStorage.setItem("card-order", JSON.stringify(next));
				return next;
			});
		}
	}

	const dashboardCards = cardOrder.filter((id) => visibleCards[id]);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={dashboardCards} strategy={rectSortingStrategy}>
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{dashboardCards.map((id) => (
						<SortableCard key={id} id={id}>
							{id === "email" && <EmailCard />}
							{id === "calendar" && <CalendarCard />}
							{id === "todo" && <TodoCard />}
							{id === "classroom" && <ClassroomCard />}
							{id === "scratchpad" && <ScratchpadCard />}

							{id === "bookmarks" && <BookmarkCard />}
						</SortableCard>
					))}
					{dashboardCards.length === 0 && (
						<div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
							All cards are hidden. Open Settings to show cards again.
						</div>
					)}
				</div>
			</SortableContext>
		</DndContext>
	);
}
