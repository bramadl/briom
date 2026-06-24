"use client";

import type { ParticipantModelDTO } from "@briom/app";
import { Badge } from "@briom/components/ui/badge";
import { Button } from "@briom/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxTrigger,
} from "@briom/components/ui/combobox";
import { FieldError } from "@briom/components/ui/field";
import { cn } from "@briom/libs/utils";
import { useParticipantSelector } from "@briom/rooms/_/participant/hooks/use-participant-selector";
import { Fragment, useState } from "react";

interface ParticipantSelectorProps {
	chosenParticipants: string;
	dialogRef: React.RefObject<HTMLDivElement | null>;
	disabled?: boolean;
	errors: [string, ...string[]] | null;
	onParticipantSelected: (participant: ParticipantModelDTO | null) => void;
}

export function ParticipantSelector({
	chosenParticipants,
	dialogRef,
	disabled,
	errors,
	onParticipantSelected,
}: ParticipantSelectorProps) {
	const [inputValue, setInputValue] = useState<string>("");

	const { filteredModels, isDeferring, isFreeModels } = useParticipantSelector({
		chosenParticipants,
		search: inputValue,
	});

	const valueChangeHandler = (participant: ParticipantModelDTO | null) => {
		onParticipantSelected(participant);
		setInputValue("");
	};

	return (
		<div className="flex flex-col gap-2">
			<Combobox
				disabled={disabled}
				filter={null}
				inputValue={inputValue}
				items={filteredModels}
				itemToStringLabel={(item: ParticipantModelDTO) => item.name}
				onInputValueChange={(value) => setInputValue(value)}
				onValueChange={valueChangeHandler}
				virtualized
			>
				<ComboboxTrigger
					render={
						<Button
							className="w-full justify-between font-normal text-muted-foreground focus-visible:border-primary! text-base md:text-sm"
							variant="outline"
						>
							Invite a perspective
						</Button>
					}
				/>
				<ComboboxContent
					className="min-w-full w-(--anchor-width)"
					container={dialogRef}
				>
					<ComboboxInput
						autoComplete="off"
						className="has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0"
						placeholder="@free anthropic, gpt, google"
						showTrigger={false}
					/>
					<ComboboxEmpty>No models match your search.</ComboboxEmpty>
					<ComboboxList
						className={cn(
							"max-h-64 overflow-y-auto",
							isDeferring && "opacity-60 transition-opacity",
						)}
					>
						{filteredModels.map((group, index) => (
							<Fragment key={group.label}>
								{index !== 0 && <ComboboxSeparator />}
								<ComboboxGroup items={group.items}>
									<ComboboxLabel>{group.label}</ComboboxLabel>
									{group.items.map((item) => {
										return (
											<ComboboxItem
												disabled={isFreeModels && !item.isFree}
												key={item.id}
												value={item}
											>
												<span className="flex-1">{item.name}</span>
												{!item.isFree && (
													<Badge className="ml-auto" variant="secondary">
														Paid
													</Badge>
												)}
											</ComboboxItem>
										);
									})}
								</ComboboxGroup>
							</Fragment>
						))}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{errors && (
				<FieldError errors={errors.map((message: string) => ({ message }))} />
			)}
		</div>
	);
}
