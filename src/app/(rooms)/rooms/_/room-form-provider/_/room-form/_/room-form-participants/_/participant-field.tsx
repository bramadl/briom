"use client";

import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { Button } from "@briom/components/ui/button";
import { Field, FieldContent, FieldError } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import { Separator } from "@briom/components/ui/separator";
import type { RoomFormSchema } from "@briom/rooms/_/room/form/schema";
import {
	Field as FormischField,
	type FormStore,
	getInput,
	remove,
} from "@formisch/react";
import { useCallback, useMemo } from "react";
import { Fragment } from "react/jsx-runtime";

interface ParticipantFieldProps {
	disabled?: boolean;
	form: FormStore<typeof RoomFormSchema>;
	index: number;
	showRemove?: boolean;
}

export function ParticipantField({
	disabled,
	form,
	index,
	showRemove,
}: ParticipantFieldProps) {
	const participant = getInput(form).participants[index];

	const initials = useMemo(() => {
		const name = participant.displayName;
		if (!name) return "AI";
		return name.length >= 2 ? name.slice(0, 2) : name.slice(0, 1);
	}, [participant]);

	const uninvite = useCallback(() => {
		remove(form, { at: index, path: ["participants"] });
	}, [form, index]);

	return (
		<div className="space-y-2">
			{showRemove && (
				<div className="flex items-center gap-4">
					<Separator className="flex-1" />
					<Button
						onClick={uninvite}
						size="xs"
						type="button"
						variant="destructive"
					>
						Uninvite
					</Button>
				</div>
			)}
			<FormischField of={form} path={["participants", index, "displayName"]}>
				{({ errors, props, input }) => {
					return (
						<Fragment>
							<Field data-invalid={errors !== null} orientation="horizontal">
								<Avatar>
									<AvatarFallback className="uppercase">
										{initials}
									</AvatarFallback>
								</Avatar>
								<FieldContent>
									<Input
										{...props}
										aria-invalid={errors !== null}
										autoComplete="off"
										disabled={disabled}
										id={`room-form-array-participant-${index}`}
										placeholder="Name this participant"
										value={input}
									/>
									{errors && (
										<FieldError
											errors={errors.map((message) => ({ message }))}
										/>
									)}
								</FieldContent>
							</Field>
							<p className="flex items-center text-xs font-mono text-muted-foreground">
								<span className="shrink-0">
									{participant.model?.split("/")[0]}
								</span>
								<span className="mx-1">/</span>
								<span className="min-w-0 flex-1 line-clamp-1">
									{participant.model}
								</span>
							</p>
						</Fragment>
					);
				}}
			</FormischField>
		</div>
	);
}
