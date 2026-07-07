"use client";

import { Button } from "@briom/components/ui/button";
import { ArrowUpIcon, LoaderCircleIcon, SquareIcon } from "lucide-react";
import { useCallback, useTransition } from "react";

interface DeliberationEditorButtonProps {
	/**
	 * @description
	 * Whether the Send action itself is unavailable (empty content, room
	 * read-only, upload in flight, etc). Callers should pass the fully
	 * negated `canSend` computed upstream — this component does not
	 * re-derive send-eligibility, it only renders it and layers
	 * `isSending`/`isStreaming` on top for the icon/abort behavior.
	 *
	 * Ignored while `isStreaming` is true: an in-flight stream must
	 * always be abortable, regardless of whether a *new* send would be
	 * allowed right now.
	 */
	isDisabled: boolean;

	/**
	 * @description
	 * True while a send is being submitted (mutation in flight and/or
	 * the editor's own local submit lock). Renders the spinner and blocks
	 * further clicks even if `isDisabled` is false.
	 */
	isSending: boolean;

	/**
	 * @description
	 * True while the claimed participant turn is actively streaming.
	 * Swaps the button into an abort affordance — see `onAbort`.
	 */
	isStreaming: boolean;

	/**
	 * @description
	 * Fires when clicked while `isStreaming` is true.
	 */
	onAbort: () => void;

	/**
	 * @description
	 * Fires when send button is clicked (not streaming).
	 */
	onSend: () => void | Promise<void>;
}

export function DeliberationEditorButton({
	isDisabled = false,
	isSending = false,
	isStreaming = false,
	onAbort,
	onSend,
}: DeliberationEditorButtonProps) {
	const [abortPending, startAborting] = useTransition();

	const handleClick = useCallback(() => {
		if (isStreaming) {
			startAborting(() => {
				onAbort();
			});
			return;
		}

		onSend();
	}, [isStreaming, onAbort, onSend]);

	return (
		<Button
			className="group/button h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={(isDisabled && !isStreaming) || isSending}
			onClick={handleClick}
			size="icon"
			type="button"
		>
			{isStreaming ? (
				abortPending ? (
					<LoaderCircleIcon className="animate-spin" />
				) : (
					<SquareIcon className="fill-current" />
				)
			) : isSending ? (
				<LoaderCircleIcon className="animate-spin" />
			) : (
				<ArrowUpIcon />
			)}
		</Button>
	);
}
