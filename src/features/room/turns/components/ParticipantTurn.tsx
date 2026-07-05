"use client";

import { Logo } from "@briom/components/logo";
import { Badge } from "@briom/components/ui/badge";
import type { TurnIntent } from "@briom/core/domain";
import { cn } from "@briom/libs/utils";
import {
	useDeliberationStore,
	useIsActiveTurn,
	useIsTurnExpanded,
} from "@briom/room/deliberation/hooks/use-deliberation-store";
import { useRoom } from "@briom/room/hooks/use-room";
import { getParticipantTheme } from "@briom/room/participant/settings/theme";
import { memo, useMemo } from "react";

import { useTurnPolling } from "../hooks/use-turn-polling";
import { TurnActions } from "./internal/TurnActions";
import { TurnContent } from "./internal/TurnContent";
import { TurnContentCollapser } from "./internal/TurnContentCollapser";
import { TurnFailed } from "./internal/TurnFailed";

interface ParticipantProfileProps {
	displayName: string;
	intent: TurnIntent | null;
	isStreaming: boolean;
	model: string;
	participantId: string;
}

function ParticipantProfile({
	displayName,
	intent,
	isStreaming,
	model,
	participantId,
}: ParticipantProfileProps) {
	const theme = getParticipantTheme(participantId);

	return (
		<div className="flex flex-col mb-2">
			<div className="flex items-center gap-2">
				<span className={cn("text-sm font-medium font-serif", theme.text)}>
					{displayName}
				</span>
				<Badge
					className={cn(
						"text-[10px] uppercase tracking-wide px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono",
						isStreaming && "opacity-60",
					)}
					variant="outline"
				>
					{isStreaming ? "writing" : (intent ?? "—")}
				</Badge>
			</div>
			<span className="text-xs text-muted-foreground">{model}</span>
		</div>
	);
}

interface ParticipantTurnProps {
	/**
	 * @description
	 * The ID of this turn. This is the ONLY prop `ParticipantTurn` takes —
	 * everything else (whether it's the active/live one, its content,
	 * its settled data from the room DTO, its expanded/collapsed state)
	 * is resolved internally, either from the deliberation store
	 * (liveness + expansion) or from `useRoom` (static settled data).
	 * This keeps `RoomSequence`'s `.map()` props fully stable across
	 * store changes, which is what lets `memo` below actually skip
	 * re-rendering every other turn in the list.
	 */
	id: string;
}

/**
 * @description
 * Static rendering path — this turn is NOT the active one. Reads
 * whatever the room DTO already has (settled/failed content) straight
 * from `useRoom`'s cached data, no polling.
 *
 * Expanded state is read via `useIsTurnExpanded(id)` — a scalar
 * per-turn selector, not the raw `expandedTurnIds` Set — so this
 * instance only re-renders when ITS OWN membership in the set changes,
 * not when any other turn toggles or when `collapseAllExpanded` clears
 * everyone else. Default (turn absent from the set) is collapsed.
 */
function StaticParticipantTurn({ id }: { id: string }) {
	const { room } = useRoom();

	const isExpanded = useIsTurnExpanded(id);
	const toggleExpanded = useDeliberationStore((s) => s.toggleExpanded);

	const turn = useMemo(
		() => room.info.turns.find((t) => t.id === id),
		[room.info.turns, id],
	);

	if (turn?.author.type !== "participant") return null;

	const { profile } = turn.author;
	if (!profile.participant) return null;

	const theme = getParticipantTheme(profile.participant.id);
	const isFailed = turn.status === "failed";
	const isCollapsed = !isExpanded;

	return (
		<div className="relative group space-y-2 w-full min-w-0 rounded-lg" id={id}>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				<ParticipantProfile
					displayName={profile.participant.name}
					intent={turn.intent}
					isStreaming={false}
					model={profile.participant.model}
					participantId={profile.participant.id}
				/>
				{isFailed ? (
					<>
						{turn.content.length > 0 && (
							<TurnContentCollapser
								className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
								isCollapsed={isCollapsed}
								onToggled={() => toggleExpanded(id)}
							>
								<TurnContent content={turn.content} />
							</TurnContentCollapser>
						)}
						<TurnFailed
							label="Perspective was not fully generated"
							reason={turn.error?.message ?? "Unknown error."}
						/>
					</>
				) : (
					<TurnContentCollapser
						className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
						isCollapsed={isCollapsed}
						onToggled={() => toggleExpanded(id)}
					>
						<TurnContent content={turn.content} />
					</TurnContentCollapser>
				)}
			</div>
			{turn.settledAt && (
				<TurnActions
					content={turn.content}
					isModerator={false}
					settledAt={turn.settledAt}
				/>
			)}
		</div>
	);
}

/**
 * @description
 * Live rendering path — this turn IS the active one per the store. Owns
 * its own polling loop (`useTurnPolling`), content lives in local state
 * inside that hook, never written back to the room query cache or the
 * store. The only things this pushes back out are the two terminal
 * signals (settled/failed), which happen inside `useTurnPolling` itself.
 *
 * Deliberately renders unconditionally expanded — there is no collapse
 * toggle here at all, unlike `StaticParticipantTurn`. A turn actively
 * streaming is, definitionally, the one turn the user wants to watch;
 * once it settles and this unmounts in favor of `StaticParticipantTurn`,
 * it renders expanded on its first paint because it was never added to
 * `expandedTurnIds` and the settle transition doesn't add it either —
 * see `RoomSequence`'s note on why that's the desired default for a
 * turn transitioning from live to static (as opposed to a turn that was
 * already static on initial room load, which should default collapsed).
 *
 * Initial author/profile info comes from the room DTO's optimistic
 * placeholder turn (created in `useInitiateTurnMutation`'s `onSuccess`)
 * or, once the room refetches, from the real DTO entry — both cases are
 * covered by the same `useRoom` lookup, so this doesn't need separate
 * wiring for "just claimed" vs "confirmed by server".
 */
function LiveParticipantTurn({ id }: { id: string }) {
	const { room, roomId } = useRoom();
	const { content, status, error } = useTurnPolling({ roomId, turnId: id });

	const turn = useMemo(
		() => room.info.turns.find((t) => t.id === id),
		[room.info.turns, id],
	);

	if (turn?.author.type !== "participant") return null;
	const { profile } = turn.author;
	if (!profile.participant) return null;

	const theme = getParticipantTheme(profile.participant.id);
	const isStreaming = status === "streaming";
	const isFailed = status === "failed";

	return (
		<div className="relative group space-y-2 w-full min-w-0 rounded-lg" id={id}>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				<ParticipantProfile
					displayName={profile.participant.name}
					intent={turn.intent}
					isStreaming={isStreaming}
					model={profile.participant.model}
					participantId={profile.participant.id}
				/>

				{isFailed ? (
					<TurnFailed
						label="Perspective was not generated"
						reason={error?.message ?? "Unknown error."}
					/>
				) : content.length === 0 ? (
					<div className="mt-4 flex items-center gap-4">
						<Logo animate />
						<span className="text-sm italic text-muted-foreground shimmer-text">
							{status === "pending"
								? "thinking for a moment..."
								: "shaping perspective..."}
						</span>
					</div>
				) : (
					<div className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
						<TurnContent content={content} />
						{isStreaming && <Logo animate className="mt-4" />}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * @description
 * Router shell. `memo`-wrapped so that, across the whole `turns.map()`
 * in `RoomSequence`, only the ONE instance whose `id` matches (or stops
 * matching) `activeTurnId`, OR whose own expanded membership changed,
 * ever re-renders. Every other instance receives an identical `{ id }`
 * prop before and after, so `memo`'s shallow comparison skips them —
 * this holds as long as `StaticParticipantTurn`/`LiveParticipantTurn`
 * only ever select scalars (`useIsTurnExpanded(id)`, `useIsActiveTurn(id)`)
 * and never the raw `expandedTurnIds` Set.
 */
export const ParticipantTurn = memo(function ParticipantTurn({
	id,
}: ParticipantTurnProps) {
	const isActive = useIsActiveTurn(id);
	return isActive ? (
		<LiveParticipantTurn id={id} />
	) : (
		<StaticParticipantTurn id={id} />
	);
});
