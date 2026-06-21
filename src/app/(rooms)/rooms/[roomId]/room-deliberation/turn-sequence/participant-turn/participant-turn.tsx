"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import { AnimatedThinking } from "@briom/components/animated/thinking";
import { Logo } from "@briom/components/logo";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@briom/components/ui/alert";
import { Badge } from "@briom/components/ui/badge";
import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";
import { useRetryTurnMutation } from "@briom/rooms/hooks/mutations";
import { getParticipantTheme } from "@briom/rooms/mappings/participant-colors.map";
import { format, parseISO } from "date-fns";
import { AlertCircleIcon, LoaderCircleIcon, RotateCcwIcon } from "lucide-react";
import { Fragment, memo, useMemo } from "react";
import { TurnPerspective } from "../turn-perspective";
import { TurnPerspectiveExpander } from "../turn-perspective/turn-perspective-expander";
import { ParticipantTurnMenu } from "./participant-turn-menu";

interface ParticipantTurnProps {
	isLastTurn?: boolean;
	isMultiDeliberationRoom?: boolean;
	participants: RoomDTO["participants"];
	turn: TurnDTO;
}

function ParticipantTurnComponent({
	isLastTurn,
	isMultiDeliberationRoom,
	participants,
	turn,
}: ParticipantTurnProps) {
	const participant = useMemo(
		() =>
			turn.author.type === "participant"
				? (participants.find((p) => p.id === turn.author.participantId) ?? null)
				: null,
		[participants, turn.author],
	);

	const theme = getParticipantTheme(turn.author.participantId);

	const displayName = participant?.name ?? "Anonymous";
	const qualifiedModel = participant?.qualifiedModel ?? "anonymous/model";
	const content = turn.perspective.content;

	const isFailed = turn.status === "failed";
	const isPending = turn.status === "pending";
	const isSettled = turn.status === "settled";
	const isStreaming = turn.status === "streaming";

	const timeSent = turn.settledAt
		? format(parseISO(turn.settledAt), "HH:mm")
		: turn.failedAt
			? format(parseISO(turn.failedAt), "HH:mm")
			: "--:--";

	const retryMutation = useRetryTurnMutation();
	const isRetrying = retryMutation.isPending || isPending || isStreaming;

	return (
		<div className="relative group space-y-2 rounded-lg" id={turn.id}>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				{isPending ? (
					<AnimatedThinking
						size="xs"
						text={
							<span className="text-sm font-medium">
								<span className={cn("font-serif", theme.text)}>
									{displayName}
								</span>{" "}
								is thinking
							</span>
						}
					/>
				) : (
					<Fragment>
						<div className="flex flex-col mb-2">
							<div className="flex items-center gap-2">
								<span
									className={cn("text-sm font-medium font-serif", theme.text)}
								>
									{displayName}
								</span>
								{isMultiDeliberationRoom && turn.intent && (
									<Badge
										className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono"
										variant="outline"
									>
										{turn.intent}
									</Badge>
								)}
								{isStreaming && (
									<span
										className={cn(
											"text-[10px] tracking-wide opacity-60",
											theme.text,
										)}
									>
										writing
									</span>
								)}
								{isFailed && (
									<Badge
										className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 font-mono"
										variant="destructive"
									>
										Failed
									</Badge>
								)}
							</div>
							<span className="text-xs text-muted-foreground">
								{qualifiedModel}
							</span>
						</div>
						{content.trim().length ? (
							isFailed ? (
								<TurnPerspectiveExpander
									className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
									defaultCollapsed={!isLastTurn}
								>
									<TurnPerspective content={content} />
									<Alert
										className="max-w-none w-full mt-4"
										variant="destructive"
									>
										<AlertCircleIcon />
										<AlertTitle>Perspective was not fully generated</AlertTitle>
										<AlertDescription>
											Cause: {turn.error?.message ?? "Unknown error"}
										</AlertDescription>
										{isLastTurn && (
											<AlertAction>
												<Button
													disabled={isRetrying}
													onClick={() =>
														retryMutation.mutate({ turnId: turn.id })
													}
													size="sm"
													variant="destructive"
												>
													{isRetrying ? (
														<LoaderCircleIcon className="animate-spin" />
													) : (
														<RotateCcwIcon />
													)}
													{isRetrying ? "Retrying" : "Retry"}
												</Button>
											</AlertAction>
										)}
									</Alert>
								</TurnPerspectiveExpander>
							) : (
								<TurnPerspectiveExpander
									className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
									defaultCollapsed={!isLastTurn}
									isStreaming={isStreaming}
								>
									<TurnPerspective content={content} />
									{isStreaming && <Logo animate className="mt-4" />}
								</TurnPerspectiveExpander>
							)
						) : isFailed ? (
							<Alert className="max-w-none w-full mt-4" variant="destructive">
								<AlertCircleIcon />
								<AlertTitle>Perspective was not generated</AlertTitle>
								<AlertDescription>
									Cause: {turn.error?.message ?? "Unknown error"}
								</AlertDescription>
								<AlertAction>
									<Button
										disabled={isRetrying}
										onClick={() => retryMutation.mutate({ turnId: turn.id })}
										size="sm"
										variant="destructive"
									>
										{isRetrying ? (
											<LoaderCircleIcon className="animate-spin" />
										) : (
											<RotateCcwIcon />
										)}
										{isRetrying ? "Retrying" : "Retry"}
									</Button>
								</AlertAction>
							</Alert>
						) : (
							<div className="mt-4 flex items-center gap-4">
								<Logo animate />
								<span className="text-sm italic text-muted-foreground">
									shaping perspective...
								</span>
							</div>
						)}
					</Fragment>
				)}
			</div>
			{isSettled && (
				<ParticipantTurnMenu
					content={turn.perspective.content}
					time={timeSent}
				/>
			)}
		</div>
	);
}

export const ParticipantTurn = memo(ParticipantTurnComponent);
