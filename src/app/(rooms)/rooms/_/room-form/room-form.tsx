"use client";

import { useRouter } from "@bprogress/next";
import { FieldGroup } from "@briom/components/ui/field";
import { cn } from "@briom/libs/utils";
import { useRoomForm } from "@briom/rooms/_/room/hooks/use-room-form";
import { Form } from "@formisch/react";
import { useCallback } from "react";

import { RoomFormActions } from "./_/room-form-actions";
import { RoomFormParticipants } from "./_/room-form-participants/room-form-participants";
import { RoomTitleField } from "./_/room-title-field";

interface RoomFormProps {
	className?: string;
}

export function RoomForm({ className }: RoomFormProps) {
	const router = useRouter();

	const form = useRoomForm({
		onRoomFormed: (roomId: string) => {
			cancelForm();
			router.push(`/rooms/${roomId}`);
		},
	});

	const cancelForm = useCallback(() => {
		form.reset();
		router.back();
	}, [form.reset, router]);

	return (
		<Form
			className={cn("h-full min-h-0 flex flex-col overflow-hidden", className)}
			id={form.id}
			of={form.form}
			onSubmit={form.submit}
		>
			<FieldGroup className="h-full min-h-0 flex flex-col px-4 overflow-hidden">
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
