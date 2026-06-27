"use client";

import { useRouter } from "@bprogress/next/app";
import { FieldGroup } from "@briom/components/ui/field";
import { useRoomForm } from "@briom/rooms/_/room/hooks/use-room-form";
import { Form } from "@formisch/react";
import { useCallback } from "react";

import { RoomFormActions } from "./_/room-form-actions";
import { RoomFormParticipants } from "./_/room-form-participants/room-form-participants";
import { RoomTitleField } from "./_/room-title-field";

export function RoomForm() {
	const router = useRouter();
	const form = useRoomForm({
		onRoomFormed: (roomId: string) => {
			router.push(`/rooms/${roomId}`);
		},
	});

	const cancelForm = useCallback(() => {
		form.reset();
		router.back();
	}, [form.reset, router]);

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
				onCancel={cancelForm}
			/>
		</Form>
	);
}
