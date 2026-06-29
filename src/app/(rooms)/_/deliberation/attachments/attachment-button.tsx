"use client";

import { Button } from "@briom/components/ui/button";
import { Loader2Icon, PaperclipIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface AttachmentButtonProps {
	canAddMore: boolean;
	isUploading?: boolean;
	onAdd: () => void;
	uploadError: string | null;
}

export function AttachmentButton({
	canAddMore,
	isUploading,
	onAdd,
	uploadError,
}: AttachmentButtonProps) {
	const disabled = !(canAddMore && !isUploading);
	useEffect(() => {
		if (!uploadError) return;
		toast.error("Failed to upload", {
			description: uploadError,
			dismissible: true,
		});
	}, [uploadError]);

	return isUploading ? (
		<div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/30 text-xs text-muted-foreground">
			<Loader2Icon className="size-3 animate-spin" />
			<span>Uploading…</span>
		</div>
	) : (
		<Button
			className="border-dashed"
			disabled={disabled}
			onClick={onAdd}
			size="sm"
			variant="outline"
		>
			<PaperclipIcon className="size-3" />
			<span>Attach</span>
		</Button>
	);
}
