"use client";

import { FieldGroup } from "@briom/components/ui/field";
import { cn } from "@briom/libs/utils";
import { useRoomForm } from "@briom/rooms/_/room/form/use-room-form";
import { useRoomFormStore } from "@briom/rooms/_/room/form/use-room-form-store";
import { Form } from "@formisch/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { RoomFormActions } from "./_/room-form-actions";
import { RoomFormParticipants } from "./_/room-form-participants";
import { RoomTitleField } from "./_/room-title-field";

interface RoomFormProps {
	className?: string;
	dialogRef: React.RefObject<HTMLDivElement | null>;
}

export function RoomForm({ className, dialogRef }: RoomFormProps) {
	const router = useRouter();
	const hide = useRoomFormStore((s) => s.hide);

	const form = useRoomForm({
		onRoomFormed: (roomId: string) => {
			cancelForm();
			router.push(`rooms/${roomId}`);
		},
	});

	const cancelForm = useCallback(() => {
		hide();
		form.reset();
	}, [hide, form.reset]);

	return (
		<Form
			className={cn("space-y-4", className)}
			id={form.id}
			of={form.form}
			onSubmit={form.submit}
		>
			<FieldGroup>
				<RoomTitleField disabled={form.disabled} form={form.form} />
				<RoomFormParticipants
					dialogRef={dialogRef}
					disabled={form.disabled}
					form={form.form}
					maxParticipants={form.maxParticipants}
					participants={form.participants}
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
