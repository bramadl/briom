"use client";

import type {
	GroupedParticipantModelsDTO,
	ParticipantModelDTO,
} from "@briom/app";
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
import { getInput, insert } from "@formisch/react";
import {
	Fragment,
	useCallback,
	useDeferredValue,
	useMemo,
	useState,
} from "react";

import type { RoomFormArraySchema } from "./schema";

interface ParticipantSelectorProps extends RoomFormArraySchema {
	dialogRef?: React.RefObject<HTMLDivElement | null>;
	models: GroupedParticipantModelsDTO;
	useFreeModels: boolean;
}

interface GroupedItems {
	items: ParticipantModelDTO[];
	label: string;
}

export function ParticipantSelector({
	dialogRef,
	disabled,
	form,
	fieldArray,
	models,
	useFreeModels,
}: ParticipantSelectorProps) {
	const [inputValue, setInputValue] = useState<string>("");
	const deferredInputValue = useDeferredValue(inputValue);
	const isStale = inputValue !== deferredInputValue;

	const chosenParticipants = getInput(form, { path: ["participants"] }) || [];
	const chosenSet = useMemo(
		() => new Set(chosenParticipants.map((p) => `${p.provider}/${p.model}`)),
		[chosenParticipants],
	);

	const flatModels = useMemo(() => Object.values(models).flat(), [models]);

	const parseQuery = useCallback((raw: string) => {
		const trimmed = raw.trim();
		const hasFree = /@free/i.test(trimmed);
		const withoutToken = trimmed.replace(/@free/gi, "").trim();
		const terms = withoutToken
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		return { hasFree, terms };
	}, []);

	const filterModels = useCallback(
		(query: string): ParticipantModelDTO[] => {
			const { hasFree, terms } = parseQuery(query);
			return flatModels.filter((model) => {
				if (chosenSet.has(model.qualifiedModel)) return false;
				if (hasFree && !model.isFree) return false;
				if (terms.length === 0) return true;
				const name = model.name.toLowerCase();
				return terms.some((term) => name.includes(term.toLowerCase()));
			});
		},
		[chosenSet, flatModels, parseQuery],
	);

	const groupedFilteredModels = useMemo((): GroupedItems[] => {
		const filtered = filterModels(deferredInputValue);
		const grouped: Record<string, ParticipantModelDTO[]> = {};
		for (const model of filtered) {
			grouped[model.provider] ??= [];
			grouped[model.provider].push(model);
		}

		return Object.entries(grouped).map(([provider, items]) => ({
			label: provider,
			items,
		}));
	}, [deferredInputValue, filterModels]);

	const handleValueChange = (selectedModel: ParticipantModelDTO | null) => {
		if (!selectedModel) return;

		insert(form, {
			path: ["participants"],
			initialInput: {
				displayName: selectedModel.name,
				model: selectedModel.model,
				provider: selectedModel.provider,
			},
		});

		setInputValue("");
	};

	return (
		<div className="flex flex-col gap-2">
			<Combobox
				disabled={disabled}
				filter={null}
				inputValue={inputValue}
				items={groupedFilteredModels}
				itemToStringLabel={(item: ParticipantModelDTO) => item.name}
				onInputValueChange={(value) => setInputValue(value)}
				onValueChange={handleValueChange}
				virtualized
			>
				<ComboboxTrigger
					render={
						<Button
							className="w-full justify-between font-normal text-muted-foreground focus-visible:border-primary!"
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
							isStale && "opacity-60 transition-opacity",
						)}
					>
						{groupedFilteredModels.map((group, index) => (
							<Fragment key={group.label}>
								{index !== 0 && <ComboboxSeparator />}
								<ComboboxGroup items={group.items}>
									<ComboboxLabel>{group.label}</ComboboxLabel>
									{group.items.map((item) => {
										const paidModel = useFreeModels && !item.isFree;
										return (
											<ComboboxItem
												disabled={paidModel}
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

			{fieldArray.errors && (
				<FieldError
					errors={fieldArray.errors.map((message: string) => ({ message }))}
				/>
			)}
		</div>
	);
}
