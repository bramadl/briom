"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@briom/components/ui/input-group";
import { type FormStore, insert, useField } from "@formisch/react";
import { SearchIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { useRoomParticipantPicker } from "../../hooks/use-room-form-participant-picker";
import type { RoomFormSchema } from "../../schema/schema";
import { RoomParticipantGrid } from "./RoomParticipantGrid";
import { RoomParticipantSelectionItem } from "./RoomParticipantSelectionItem";

interface RoomParticipantPickerProps {
	/**
	 * @description
	 * Wether to disable the input.
	 */
	disabled?: boolean;

	/**
	 * @description
	 * Form instance resolving the `RoomFormSchema`.
	 */
	form: FormStore<RoomFormSchema>;

	/**
	 * @description
	 * If true, non selected participant will be disabled.
	 */
	maxParticipantsReached?: boolean;
}

export function RoomParticipantPicker({
	disabled,
	form,
	maxParticipantsReached = false,
}: RoomParticipantPickerProps) {
	const participants = useField(form, { path: ["participants"] }).input;
	const {
		filteredModels,
		isFeatured,
		isFiltering,
		isLoading,
		isSelected,
		query,
		setQuery,
	} = useRoomParticipantPicker({ participants });

	const inviteHandler = (model: (typeof filteredModels)[number]) => {
		insert(form, {
			path: ["participants"],
			initialInput: {
				displayName: model.name,
				model: model.id,
				provider: model.provider,
			},
		});
	};

	return (
		<Fragment>
			<div className="px-4">
				<InputGroup className="shrink-0">
					<InputGroupAddon align="inline-start">
						<SearchIcon className="size-4 text-muted-foreground" />
					</InputGroupAddon>
					<InputGroupInput
						disabled={disabled}
						onChange={(e) => setQuery(e.currentTarget.value)}
						placeholder="@free anthropic, gpt, google"
						value={query}
					/>
				</InputGroup>
			</div>
			<RoomParticipantGrid isLoading={isLoading} models={filteredModels}>
				{(model) => (
					<RoomParticipantSelectionItem
						disabled={
							disabled ||
							!model.isFree ||
							(maxParticipantsReached && !isSelected(model))
						}
						isFeatured={isFeatured(model)}
						isPending={isFiltering}
						isSelected={isSelected(model)}
						key={model.id}
						model={model}
						onSelect={() => {
							if (isSelected(model)) return;
							inviteHandler(model);
						}}
					/>
				)}
			</RoomParticipantGrid>
		</Fragment>
	);
}
