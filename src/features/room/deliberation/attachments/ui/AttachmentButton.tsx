"use client";

import { Button } from "@briom/components/ui/button";
import { Loader2Icon, PaperclipIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface AttachmentButtonProps {
	/**
	 * @description
	 * Whether a new attachment is allowed to be added right now.
	 *
	 * Positive polarity on purpose — parent composes this from every
	 * relevant condition (room capacity via `canAddMore`, in-flight
	 * mutation via `!isPending`, etc). Internally this is still merged
	 * with `isUploading`, since mid-upload is never a valid moment to
	 * start a second upload regardless of what the parent computed.
	 */
	canAdd: boolean;

	/**
	 * @description
	 * Renders the uploading state when true. Combined with `canAdd`,
	 * the button is disabled during upload regardless of `canAdd`'s value.
	 */
	isUploading?: boolean;

	/**
	 * @description
	 * Fires when the attach button is clicked.
	 */
	onAttach: () => void;

	/**
	 * @description
	 * Toast an error if given. Parent has to process the file by themselves.
	 */
	uploadError: string | null;
}

export function AttachmentButton({
	canAdd,
	isUploading,
	onAttach,
	uploadError,
}: AttachmentButtonProps) {
	const disabled = !canAdd || isUploading;

	useEffect(() => {
		if (!uploadError) return;
		toast.error("Failed to upload", {
			description: uploadError,
			dismissible: true,
		});
	}, [uploadError]);

	if (isUploading) {
		return (
			<div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/30 text-xs text-muted-foreground">
				<Loader2Icon className="size-3 animate-spin" />
				<span>Uploading…</span>
			</div>
		);
	}

	return (
		<Button
			className="border-dashed"
			disabled={disabled}
			onClick={onAttach}
			size="sm"
			variant="outline"
		>
			<PaperclipIcon className="size-3" />
			<span>Attach</span>
		</Button>
	);
}
