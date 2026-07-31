import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SortableCardProps {
	id: string;
	children: React.ReactNode;
}

export function SortableCard({ id, children }: SortableCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			id={`card-${id}`}
			style={style}
			className="xl:col-span-2 scroll-mt-6"
		>
			<Card className="relative h-full">
				<button
					{...attributes}
					{...listeners}
					className="absolute right-3 top-3 z-10 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
					aria-label="Drag to reorder"
				>
					<GripVertical className="h-4 w-4" />
				</button>
				{children}
			</Card>
		</div>
	);
}
