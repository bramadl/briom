"use client";

import { Button } from "@briom/components/ui/button";
import { Field, FieldContent, FieldError } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import { Separator } from "@briom/components/ui/separator";
import {
	Field as FormischField,
	type FormStore,
	useField,
} from "@formisch/react";
import { Fragment } from "react/jsx-runtime";

import type { RoomFormSchema } from "../../schema/schema";

interface RoomParticipantFieldProps {
	/**
	 * @description
	 * If true, renders the `un-invite` button.
	 */
	canUninvite: boolean;
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
	 * Runs when the `un-invite` button clicked.
	 */
	onUninvited: VoidFunction;

	/**
	 * @description
	 * Index-based position of the participant within the form.
	 */
	position: number;
}

export function RoomParticipantField({
	disabled,
	canUninvite,
	form,
	onUninvited,
	position,
}: RoomParticipantFieldProps) {
	useField;

	const model = useField(form, {
		path: ["participants", position, "model"],
	}).input;

	const provider = useField(form, {
		path: ["participants", position, "provider"],
	}).input;

	return (
		<div className="space-y-2">
			{canUninvite && (
				<div className="flex items-center gap-4">
					<Button
						disabled={disabled}
						onClick={onUninvited}
						size="xs"
						type="button"
						variant="destructive"
					>
						Uninvite
					</Button>
					<Separator className="flex-1" />
				</div>
			)}

			<FormischField of={form} path={["participants", position, "displayName"]}>
				{({ errors, props, input }) => {
					return (
						<Fragment>
							<Field data-invalid={errors !== null} orientation="horizontal">
								<FieldContent>
									<Input
										{...props}
										aria-invalid={errors !== null}
										autoComplete="off"
										disabled={disabled}
										id={`room-form-array-participant-${position}`}
										placeholder="Name this participant"
										value={input}
									/>
									{errors && (
										<FieldError
											errors={errors.map((message) => ({
												message,
											}))}
										/>
									)}
								</FieldContent>
							</Field>
							<p className="flex items-center text-xs font-mono text-muted-foreground">
								<span className="shrink-0">{provider}</span>/
								<span className="min-w-0 flex-1 line-clamp-1">{model}</span>
							</p>
						</Fragment>
					);
				}}
			</FormischField>
		</div>
	);
}
