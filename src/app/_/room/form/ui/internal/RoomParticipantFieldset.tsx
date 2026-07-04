"use client";

import {
	FieldDescription,
	FieldLegend,
	FieldSet,
} from "@briom/components/ui/field";
import { FieldArray, type FormStore, remove } from "@formisch/react";

import type { RoomFormSchema } from "../../schema";
import { RoomParticipantField } from "./RoomParticipantField";
import { RoomParticipantPicker } from "./RoomParticipantPicker";

interface RoomParticipantFieldsetProps {
	form: FormStore<RoomFormSchema>;
	maxParticipants: number;
	maxParticipantsReached?: boolean;
}

export function RoomParticipantFieldset({
	form,
	maxParticipants,
	maxParticipantsReached = false,
}: RoomParticipantFieldsetProps) {
	const uninviteHandler = (at: number) => {
		remove(form, { at, path: ["participants"] });
	};

	return (
		<FieldArray of={form} path={["participants"]}>
			{(fieldArray) => (
				<FieldSet className="overflow-hidden">
					<FieldLegend className="px-4" variant="label">
						Invite Participants
					</FieldLegend>
					<FieldDescription className="px-4">
						{maxParticipantsReached
							? "All good, you can start forming the room now."
							: `Select up to ${maxParticipants - fieldArray.items.length} AI perspectives for this deliberation.`}
					</FieldDescription>
					<div className="flex-1 flex flex-col pt-1 -mt-1 overflow-hidden">
						{fieldArray.items.length > 0 && (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 shrink-0 mb-4 px-4">
								{fieldArray.items.map((item, index) => (
									<RoomParticipantField
										canUninvite={fieldArray.items.length > 1}
										form={form}
										key={item}
										onUninvited={() => uninviteHandler(index)}
										position={index}
									/>
								))}
							</div>
						)}
						<RoomParticipantPicker
							form={form}
							maxParticipantsReached={maxParticipantsReached}
						/>
					</div>
				</FieldSet>
			)}
		</FieldArray>
	);
}
