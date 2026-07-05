"use client";

import { Accordion } from "@briom/components/ui/accordion";
import { Button } from "@briom/components/ui/button";
import { Separator } from "@briom/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@briom/components/ui/sheet";
import { PanelRightIcon } from "lucide-react";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";

import { RoomDetail } from "./internal/RoomDetail";
import { RoomParticipants } from "./internal/RoomParticipants";
import { RoomTimeline } from "./internal/RoomTimeline";
import { RoomTopic } from "./internal/RoomTopic";

function InformationList() {
	return (
		<Accordion
			className="sticky z-1 top-14 w-72 h-full shrink-0 self-start hidden lg:flex flex-col bg-background/80 backdrop-blur-sm border-l overflow-y-auto select-none"
			defaultValue={["topic", "participants", "timeline"]}
			type="multiple"
		>
			<RoomTopic />
			<RoomParticipants />
			<RoomTimeline />
			<RoomDetail />
			<Separator />
		</Accordion>
	);
}

function InformationSheet() {
	const [open, setOpen] = useState(false);
	return (
		<Fragment>
			<Button
				className="fixed right-4 top-20 z-40 lg:hidden size-10 rounded-full shadow-lg border border-border/50 bg-background/80 backdrop-blur-sm"
				onClick={() => setOpen(true)}
				size="icon"
				variant="ghost"
			>
				<PanelRightIcon />
			</Button>

			<Sheet onOpenChange={setOpen} open={open}>
				<SheetContent
					className="w-80 p-0 border-l border-border/50"
					side="right"
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Room Information</SheetTitle>
						<SheetDescription>Room details and timeline</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col h-full overflow-y-auto bg-background/80 backdrop-blur-sm">
						<InformationList />
					</div>
				</SheetContent>
			</Sheet>
		</Fragment>
	);
}

export function RoomInformation() {
	return (
		<Fragment>
			<InformationList />
			<InformationSheet />
		</Fragment>
	);
}
