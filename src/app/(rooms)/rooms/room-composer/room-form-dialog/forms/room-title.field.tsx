import { Field, FieldError, FieldLabel } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import { Field as FormischField } from "@formisch/react";

import type { RoomFormSchema } from "./schema";

interface RoomTitleFieldProps extends RoomFormSchema {}

export function RoomTitleField({ disabled, form }: RoomTitleFieldProps) {
	return (
		<FormischField of={form} path={["title"]}>
			{(field) => (
				<Field data-invalid={field.errors !== null}>
					<FieldLabel htmlFor="room-form-title">Room Name</FieldLabel>
					<Input
						{...field.props}
						aria-invalid={field.errors !== null}
						autoComplete="off"
						disabled={disabled}
						id="room-form-title"
						placeholder="e.g., Rethinking our onboarding flow"
						value={field.input ?? ""}
					/>
					{field.errors && (
						<FieldError errors={field.errors.map((message) => ({ message }))} />
					)}
				</Field>
			)}
		</FormischField>
	);
}
