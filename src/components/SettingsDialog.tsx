import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cardLabels, type CardId, defaultCardOrder } from "@/types";
import { Button } from "./ui/button";
import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarProvider,
} from "./ui/sidebar";

interface SettingsDialogProps {
	visibleCards: Record<CardId, boolean>;
	onVisibleCardsChange: (visibleCards: Record<CardId, boolean>) => void;
}

export function SettingsDialog({
	visibleCards,
	onVisibleCardsChange,
}: SettingsDialogProps) {
	function handleCardVisibilityChange(cardId: CardId, checked: boolean) {
		onVisibleCardsChange({ ...visibleCards, [cardId]: checked });
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Settings</Button>
			</DialogTrigger>

			<DialogContent className="flex h-[95vh] w-[95vw] max-w-none gap-0 p-0">
				{/* Content */}
				<main className="flex-1 overflow-y-auto p-6">
					<DialogHeader>
						<DialogTitle>Settings</DialogTitle>
					</DialogHeader>

					<div className="mt-6 flex flex-col gap-6">
						<section>
							<h3 className="font-medium">Cards</h3>
							<p className="text-muted-foreground text-sm">
								Choose which dashboard cards are visible.
							</p>

							<div className="mt-4 flex flex-col gap-3">
								{defaultCardOrder.map((cardId) => (
									<div
										key={cardId}
										className="flex items-center gap-3 rounded-md border p-3 text-sm"
									>
										<Checkbox
											checked={visibleCards[cardId]}
											onCheckedChange={(checked) =>
												handleCardVisibilityChange(cardId, checked === true)
											}
										/>
										<span>{cardLabels[cardId]}</span>
									</div>
								))}
							</div>
						</section>
					</div>
				</main>
			</DialogContent>
		</Dialog>
	);
}
