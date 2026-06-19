import type { GroupedParticipantModelsDTO } from "@briom/app";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@briom/components/ui/field";
import { FieldArray, Form, type SubmitHandler } from "@formisch/react";

import { ParticipantIdentityField } from "./participant-identity.field";
import { ParticipantSelector } from "./participant-selector";
import { RoomTitleField } from "./room-title.field";
import { MAX_PARTICIPANTS, type RoomFormSchema } from "./schema";

interface RoomFormProps extends RoomFormSchema {
	dialogRef?: React.RefObject<HTMLDivElement | null>;
	models: GroupedParticipantModelsDTO;
	onSubmit: SubmitHandler<typeof RoomFormSchema>;
	useFreeModels: boolean;
}

export function RoomForm({
	dialogRef,
	disabled,
	form,
	models,
	onSubmit,
	useFreeModels,
}: RoomFormProps) {
	return (
		<Form className="my-4" id="room-form" of={form} onSubmit={onSubmit}>
			<FieldGroup>
				<RoomTitleField disabled={disabled} form={form} />
				<FieldArray of={form} path={["participants"]}>
					{(fieldArray) => {
						const items = fieldArray.items;
						const maxParticipantReached = items.length === MAX_PARTICIPANTS;
						return (
							<FieldSet className="gap-4">
								<FieldLegend variant="label">Invite Participants</FieldLegend>
								<FieldDescription>
									Select up to {MAX_PARTICIPANTS} AI perspectives for this
									deliberation.
								</FieldDescription>
								<FieldGroup className="gap-4">
									{items.length !== MAX_PARTICIPANTS && (
										<ParticipantSelector
											dialogRef={dialogRef}
											disabled={disabled || maxParticipantReached}
											fieldArray={fieldArray}
											form={form}
											models={models}
											useFreeModels={useFreeModels}
										/>
									)}
									{items.map((item, index) => (
										<ParticipantIdentityField
											canRemove={!disabled || items.length > 1}
											form={form}
											index={index}
											key={item}
										/>
									))}
								</FieldGroup>
							</FieldSet>
						);
					}}
				</FieldArray>
			</FieldGroup>
		</Form>
	);
}
