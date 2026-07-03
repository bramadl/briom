"use client";

import { FieldGroup } from "@briom/components/ui/field";
import { useRoomForm } from "@briom/rooms/_/room/hooks/use-room-form";
import { Form } from "@formisch/react";

import { RoomFormActions } from "./_/room-form-actions";
import { RoomFormParticipants } from "./_/room-form-participants/room-form-participants";
import { RoomTitleField } from "./_/room-title-field";

interface RoomFormProps {
	onCancel: () => void;
	onSuccess: (roomId: string) => void;
}

export function RoomForm({ onSuccess, onCancel }: RoomFormProps) {
	const form = useRoomForm({
		onRoomFormed: (roomId: string) => {
			form.reset();
			onSuccess(roomId);
		},
	});

	return (
		<Form
			className="flex-1 flex flex-col overflow-hidden"
			id={form.id}
			of={form.form}
			onSubmit={form.submit}
		>
			<FieldGroup className="flex-1 overflow-hidden">
				<RoomTitleField disabled={form.disabled} form={form.form} />
				<RoomFormParticipants
					disabled={form.disabled}
					form={form.form}
					maxParticipants={form.maxParticipants}
				/>
			</FieldGroup>
			<RoomFormActions
				formId={form.id}
				isForming={form.forming}
				isInviting={form.inviting}
				isSubmitting={form.submitting}
				onCancel={onCancel}
			/>
		</Form>
	);
}
