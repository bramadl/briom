import type { ParticipantModelDTO } from "@briom/app";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@briom/components/ui/field";
import type { RoomFormSchema } from "@briom/rooms/_/room/form/schema";
import { FieldArray, type FormStore, getInput, insert } from "@formisch/react";
import { useCallback, useMemo } from "react";

import { ParticipantField } from "./_/participant-field";
import { ParticipantSelector } from "./_/participant-selector";

interface RoomFormParticipantsProps {
	dialogRef: React.RefObject<HTMLDivElement | null>;
	disabled?: boolean;
	form: FormStore<typeof RoomFormSchema>;
	maxParticipants: number;
	participants: string[];
}

export function RoomFormParticipants({
	dialogRef,
	disabled,
	form,
	maxParticipants,
	participants,
}: RoomFormParticipantsProps) {
	const showSelector = participants.length !== maxParticipants;

	const chosenParticipants = useMemo(() => {
		return participants
			.map((_, i) => {
				const p = getInput(form, { path: ["participants", i] });
				return `${p?.provider}/${p?.model}`;
			})
			.join(",");
	}, [participants, form]);

	const participantSelectedHandler = useCallback(
		(selectedModel: ParticipantModelDTO | null) => {
			if (!selectedModel) return;
			insert(form, {
				path: ["participants"],
				initialInput: {
					displayName: selectedModel.name,
					model: selectedModel.model,
					provider: selectedModel.provider,
				},
			});
		},
		[form],
	);

	return (
		<FieldArray of={form} path={["participants"]}>
			{(fieldArray) => (
				<FieldSet className="gap-4">
					<FieldLegend variant="label">Invite Participants</FieldLegend>
					<FieldDescription>
						Select up to {maxParticipants} AI perspectives for this
						deliberation.
					</FieldDescription>
					<FieldGroup className="gap-4">
						{showSelector && (
							<ParticipantSelector
								chosenParticipants={chosenParticipants}
								dialogRef={dialogRef}
								disabled={disabled}
								errors={fieldArray.errors}
								onParticipantSelected={participantSelectedHandler}
							/>
						)}
						{fieldArray.items.map((item, index) => (
							<ParticipantField
								disabled={disabled}
								form={form}
								index={index}
								key={item}
								showRemove={fieldArray.items.length > 1}
							/>
						))}
					</FieldGroup>
				</FieldSet>
			)}
		</FieldArray>
	);
}
