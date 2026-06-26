import type { ParticipantModelDTO } from "@briom/app";
import {
	FieldDescription,
	FieldLegend,
	FieldSet,
} from "@briom/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@briom/components/ui/input-group";
import { useParticipantModels } from "@briom/rooms/_/participant/hooks/use-participant-models";
import type { RoomFormSchema } from "@briom/rooms/_/room/form/schema";
import {
	FieldArray,
	type FormStore,
	insert,
	remove,
	useField,
} from "@formisch/react";
import { useCallback, useMemo, useState } from "react";

import { ParticipantField } from "./_/participant-field";
import { ParticipantSelector } from "./_/participant-selector";

interface RoomFormParticipantsProps {
	disabled?: boolean;
	form: FormStore<typeof RoomFormSchema>;
	maxParticipants: number;
}

export function RoomFormParticipants({
	disabled,
	form,
	maxParticipants,
}: RoomFormParticipantsProps) {
	const { flatModels, useFreeModels } = useParticipantModels();
	const [inputValue, setInputValue] = useState<string>("");

	const participants = useField(form, { path: ["participants"] });
	const currentParticipantsLength = participants.input.length;
	const maxReached = currentParticipantsLength >= maxParticipants;

	const parseQuery = useCallback((raw: string) => {
		const trimmed = raw.trim();
		const hasFree = /@free/i.test(trimmed);
		const withoutToken = trimmed.replace(/@free/gi, "").trim();
		const terms = withoutToken
			.split(",")
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean);

		return { hasFree, terms };
	}, []);

	const filteredModels = useMemo(() => {
		const { hasFree, terms } = parseQuery(inputValue);

		if (!hasFree && terms.length === 0) return flatModels;
		return flatModels.filter((model) => {
			if (hasFree && !model.isFree) return false;

			if (terms.length > 0) {
				const matchesAnyTerm = terms.some((term) => {
					return (
						model.name.toLowerCase().includes(term) ||
						model.qualifiedModel.toLowerCase().includes(term) ||
						model.provider.toLowerCase().includes(term)
					);
				});

				if (!matchesAnyTerm) return false;
			}

			return true;
		});
	}, [inputValue, flatModels, parseQuery]);

	const modelSelectedHandler = (
		{ model, name, provider }: ParticipantModelDTO,
		isSelected: boolean,
	) => {
		if (isSelected) {
			insert(form, {
				path: ["participants"],
				initialInput: { displayName: name, model, provider },
			});
		} else {
			const indexToRemove = participants.input.findIndex(
				(p) => p.model === model,
			);

			if (indexToRemove !== -1) {
				remove(form, { path: ["participants"], at: indexToRemove });
			}
		}
	};

	return (
		<FieldArray of={form} path={["participants"]}>
			{(fieldArray) => (
				<FieldSet className="h-full min-h-0 flex flex-col gap-4 -mx-2 px-2 overflow-hidden">
					<FieldLegend variant="label">Invite Participants</FieldLegend>
					<FieldDescription>
						{maxReached
							? "All good, you can start forming the room now."
							: `Select up to ${maxParticipants - currentParticipantsLength} AI perspectives for this deliberation.`}
					</FieldDescription>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
						{fieldArray.items.map((item, index) => (
							<ParticipantField
								disabled={disabled}
								form={form}
								index={index}
								key={item}
								showRemove={fieldArray.items.length > 1}
							/>
						))}
					</div>
					<div className="h-full min-h-0 flex flex-col gap-4 -mx-2 px-2 -mt-1 pt-1 overflow-hidden">
						<InputGroup className="shrink-0">
							<InputGroupInput
								onChange={(e) => setInputValue(e.currentTarget.value)}
								placeholder="@free anthropic, gpt, google"
								value={inputValue}
							/>
							<InputGroupAddon align={"inline-end"} />
						</InputGroup>
						<div className="flex-1 grid md:grid-cols-2 lg:grid-cols-4 content-start gap-4 overflow-y-auto pr-1">
							{filteredModels.length > 0 ? (
								filteredModels.map((model) => (
									<ParticipantSelector
										disabled={disabled || maxReached}
										key={model.id}
										lockFreeModel={useFreeModels}
										model={model}
										onModelSelected={(sel) => modelSelectedHandler(model, sel)}
									/>
								))
							) : (
								<div className="col-span-4 text-center py-4 lg:py-8 text-sm text-muted-foreground">
									No AI models match your criteria.
								</div>
							)}
						</div>
					</div>
				</FieldSet>
			)}
		</FieldArray>
	);
}
