"use client";

import { Button } from "@briom/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@briom/components/ui/sheet";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

interface SynthesisSheetProps {
	content: string;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function SynthesisSheet({
	content,
	open,
	onOpenChange,
}: SynthesisSheetProps) {
	const [_, copy] = useCopyToClipboard();
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async () => {
		const success = await copy(content);
		if (success) {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent>
				<SheetHeader className="border-b">
					<SheetTitle>Synthesis</SheetTitle>
					<SheetDescription className="sr-only">
						Generated synthesis
					</SheetDescription>
				</SheetHeader>
				<div className="flex-1 px-4 overflow-y-auto">
					<div className="prose prose-sm dark:prose-invert min-w-0 max-w-none">
						<TurnPerspective content={content} />
					</div>
				</div>
				<SheetFooter className="border-t">
					<Button data-no-copy onClick={handleCopy} variant="secondary">
						{isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
						{isCopied ? "Copied!" : "Copy Synthesis"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
