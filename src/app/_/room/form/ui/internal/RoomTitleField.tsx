import { Field, FieldError, FieldLabel } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import { Field as FormischField, type FormStore } from "@formisch/react";

import type { RoomFormSchema } from "../../schema";

interface RoomTitleFieldProps {
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
}

export function RoomTitleField({ disabled, form }: RoomTitleFieldProps) {
	return (
		<FormischField of={form} path={["title"]}>
			{({ errors, props, input }) => (
				<Field className="px-4" data-invalid={errors !== null}>
					<FieldLabel htmlFor="room-form-title">Room Title</FieldLabel>
					<Input
						{...props}
						aria-invalid={errors !== null}
						autoComplete="off"
						disabled={disabled}
						id="room-form-title"
						placeholder="e.g., Rethinking our onboarding flow"
						value={input}
					/>
					{errors && (
						<FieldError errors={errors.map((message) => ({ message }))} />
					)}
				</Field>
			)}
		</FormischField>
	);
}
