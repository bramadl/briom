"use client";

import { FieldGroup } from "@briom/components/ui/field";
import { cn } from "@briom/libs/utils";
import { Form } from "@formisch/react";

import { useRoomForm } from "../hooks/use-room-form";
import { RoomFormActions } from "./internal/RoomFormActions";
import { RoomParticipantFieldset } from "./internal/RoomParticipantFieldset";
import { RoomTitleField } from "./internal/RoomTitleField";

interface RoomFormProps {
	/**
	 * @description
	 * Runs when the cancel button is clicked.
	 */
	onCanceled: VoidFunction;

	/**
	 * @description
	 * Runs after the room has been successfully formed.
	 */
	onFormed: (roomId: string) => void;

	/**
	 * @description
	 * Wether to add extra horizontal padding or not on
	 * the form content (& form actions or footer).
	 *
	 * Due to the form can be displayed on a modal (or
	 * directly to a page)–proper sizing has to be defined
	 * by the parent.
	 *
	 * @defaults true
	 */
	padded?: boolean;
}

export function RoomForm({
	onCanceled,
	onFormed,
	padded = true,
}: RoomFormProps) {
	const {
		id,
		isForming,
		form,
		maxParticipants,
		maxParticipantsReached,
		submit,
	} = useRoomForm({
		onRoomFormed: onFormed,
	});

	return (
		<Form
			className="flex-1 flex flex-col overflow-hidden"
			id={id}
			of={form}
			onSubmit={submit}
		>
			<FieldGroup
				className={cn("flex-1 overflow-hidden", padded && "px-2 sm:px-4")}
			>
				<RoomTitleField disabled={isForming} form={form} />
				<RoomParticipantFieldset
					disabled={isForming}
					form={form}
					maxParticipants={maxParticipants}
					maxParticipantsReached={maxParticipantsReached}
				/>
			</FieldGroup>
			<RoomFormActions
				className={cn(padded && "px-6 sm:px-8")}
				id={id}
				isSubmitting={isForming}
				onCanceled={onCanceled}
			/>
		</Form>
	);
}
