import { FieldGroup } from "@briom/components/ui/field";
import { MAXIMUM_PARTICIPANT } from "@briom/rooms/settings/room-settings";
import {
	FieldArray,
	Form,
	getInput,
	type SubmitHandler,
} from "@formisch/react";

import { ParticipantField } from "./participant-field";
import { RoomTitleField } from "./room-title.field";
import type { RoomFormSchema } from "./schema";

interface RoomFormProps extends RoomFormSchema {
	dialogRef?: React.RefObject<HTMLDivElement | null>;
	id: string;
	onSubmit: SubmitHandler<typeof RoomFormSchema>;
}

export function RoomForm({
	id,
	dialogRef,
	disabled,
	form,
	onSubmit,
}: RoomFormProps) {
	const { participants } = getInput(form);
	const maxParticipantReached = participants.length === MAXIMUM_PARTICIPANT;

	return (
		<Form className="my-4" id={id} of={form} onSubmit={onSubmit}>
			<FieldGroup>
				<RoomTitleField disabled={disabled} form={form} />
				<FieldArray of={form} path={["participants"]}>
					{(fieldArray) => {
						return (
							<ParticipantField
								dialogRef={dialogRef}
								disabled={disabled}
								fieldArray={fieldArray}
								form={form}
								maxParticipantCount={MAXIMUM_PARTICIPANT}
								maxParticipantReached={maxParticipantReached}
							/>
						);
					}}
				</FieldArray>
			</FieldGroup>
		</Form>
	);
}
