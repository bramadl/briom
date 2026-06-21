import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@briom/components/ui/field";

import { ParticipantIdentityField } from "./participant-identity.field";
import { ParticipantSelector } from "./participant-selector";
import type { RoomFormArraySchema } from "./schema";

interface ParticipantFieldProps extends RoomFormArraySchema {
	dialogRef?: React.RefObject<HTMLDivElement | null>;
	maxParticipantCount?: number;
	maxParticipantReached?: boolean;
}

export function ParticipantField({
	dialogRef,
	disabled,
	fieldArray,
	form,
	maxParticipantCount = 0,
	maxParticipantReached = false,
}: ParticipantFieldProps) {
	return (
		<FieldSet className="gap-4">
			<FieldLegend variant="label">Invite Participants</FieldLegend>
			<FieldDescription>
				Select up to {maxParticipantCount} AI perspectives for this
				deliberation.
			</FieldDescription>
			<FieldGroup className="gap-4">
				{!maxParticipantReached && (
					<ParticipantSelector
						dialogRef={dialogRef}
						disabled={disabled || maxParticipantReached}
						fieldArray={fieldArray}
						form={form}
					/>
				)}
				{fieldArray.items.map((item, index) => (
					<ParticipantIdentityField
						canRemove={!disabled || fieldArray.items.length > 1}
						disabled={disabled}
						form={form}
						index={index}
						key={item}
					/>
				))}
			</FieldGroup>
		</FieldSet>
	);
}
