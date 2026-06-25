import type { RoomDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@briom/components/ui/popover";
import { Separator } from "@briom/components/ui/separator";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { cn } from "@briom/libs/utils";
import { ParticipantBadge } from "@briom/rooms/_/participant/ui/participant-badge";
import { useSynthesizeRoom } from "@briom/rooms/_/room/synthesis/use-synthesize-room";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useState } from "react";

interface SynthesizeRoomProps {
	participants: RoomDTO["participants"];
	roomId: string;
}

/**
 * @description
 * `SynthesizeRoom` — Feature Component
 *
 * Popover-based participant selection for synthesis initiation.
 *
 * **UX Flow**
 * 1. User clicks "Synthesize" button → Popover opens
 * 2. User selects a participant (model) from the list
 * 3. User clicks "Synthesize" in Popover → mutation starts
 * 4. Popover closes, loading state shown on button
 * 5. LLM generates synthesis (blocking query in background)
 * 6. On success: Sheet auto-opens with the synthesis document
 * 7. On error: Toast notification, synthesis status reset
 *
 * **Why Popover for Selection?**
 * Popover is the right container for selection UI — compact, anchored
 * to the trigger. The *result* goes in a Sheet (see SynthesisSheet).
 *
 * **Domain Language**
 * The UI button says "Synthesize" (domain ubiquitous language),
 * not "Summarize" (user-facing synonym). This maintains consistency
 * with the domain model where `Synthesis` is the core concept.
 *
 * @see SynthesisSheet — for displaying the synthesis result (lives in room page)
 * @see useSynthesizeRoom — for the synthesis orchestration hook
 */
export function SynthesizeRoom({ roomId, participants }: SynthesizeRoomProps) {
	const isMobile = useIsMobile();

	const [open, setOpen] = useState(false);
	const [selectedParticipantId, setSelectedParticipantId] = useState<
		string | null
	>(null);

	const { isLoading, synthesize } = useSynthesizeRoom({ roomId });
	const handleSynthesize = async () => {
		if (!selectedParticipantId) return;
		setOpen(false);
		await synthesize(selectedParticipantId);
	};

	return (
		<Popover
			onOpenChange={(v) => {
				if (v) setSelectedParticipantId(null);
				setOpen(v);
			}}
			open={open}
		>
			<PopoverTrigger asChild>
				<Button
					disabled={isLoading}
					size={isMobile ? "icon" : "default"}
					variant="secondary"
				>
					{isLoading ? (
						<Loader2Icon className="animate-spin" />
					) : (
						<SparklesIcon />
					)}
					<span className="hidden sm:inline">
						{isLoading ? "Synthesizing..." : "Synthesize"}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom">
				<PopoverHeader>
					<PopoverTitle>Synthesize Deliberation</PopoverTitle>
					<PopoverDescription>
						Choose which participant&apos;s perspective should synthesize this
						deliberation. Each model brings a unique interpretive lens.
					</PopoverDescription>
				</PopoverHeader>
				<div className="flex flex-col gap-2">
					<ul className="space-y-1">
						{participants.map((participant) => (
							<li
								className={cn(
									"text-sm border border-transparent rounded-lg",
									participant.id === selectedParticipantId
										? "border-muted-foreground/5 bg-muted"
										: "hover:bg-muted/50",
								)}
								key={participant.id}
							>
								<button
									className="size-full flex items-center gap-3 p-2 outline-none select-none"
									onClick={() =>
										setSelectedParticipantId((prev) =>
											prev === participant.id ? null : participant.id,
										)
									}
									type="button"
								>
									<ParticipantBadge
										name={participant.name}
										participantId={participant.id}
									/>
									<span className="flex flex-col items-start">
										<span>{participant.name}</span>
										<span className="text-muted-foreground text-xs">
											{participant.qualifiedModel}
										</span>
									</span>
								</button>
							</li>
						))}
					</ul>
					<Separator />
					<div className="flex items-center justify-end gap-2">
						<Button
							disabled={!selectedParticipantId || isLoading}
							onClick={handleSynthesize}
						>
							{isLoading && <Loader2Icon className="animate-spin size-4" />}
							{isLoading ? "Synthesizing..." : "Synthesize"}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
