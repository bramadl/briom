import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { Field, FieldContent, FieldError } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import { Field as FormischField } from "@formisch/react";

import { ParticipantRemover } from "./participant-remover";
import type { RoomFormSchema } from "./schema";

interface ParticipantIdentityFieldProps extends RoomFormSchema {
	canRemove?: boolean;
	index: number;
}

export function ParticipantIdentityField({
	canRemove,
	disabled,
	form,
	index,
}: ParticipantIdentityFieldProps) {
	return (
		<div className="space-y-2">
			{canRemove && <ParticipantRemover form={form} index={index} />}
			<FormischField of={form} path={["participants", index, "displayName"]}>
				{(field) => (
					<>
						<Field
							data-invalid={field.errors !== null}
							orientation="horizontal"
						>
							<Avatar>
								<AvatarFallback className="uppercase">
									{(field.input as string).charAt(0) +
										(field.input as string).charAt(1)}
								</AvatarFallback>
							</Avatar>
							<FieldContent>
								<Input
									{...field.props}
									aria-invalid={field.errors !== null}
									autoComplete="off"
									disabled={disabled}
									id={`room-form-array-participant-${index}`}
									placeholder="Name this participant (e.g., 'Claude', 'GPT-4')"
									value={field.input ?? ""}
								/>
								{field.errors && (
									<FieldError
										errors={field.errors.map((message) => ({
											message,
										}))}
									/>
								)}
							</FieldContent>
						</Field>
						<p className="flex flex-nowrap items-center text-xs text-muted-foreground font-mono">
							<FormischField
								of={form}
								path={["participants", index, "provider"]}
							>
								{(field) => <span className="shrink-0">{field.input}</span>}
							</FormischField>
							<span className="mx-1">/</span>
							<FormischField of={form} path={["participants", index, "model"]}>
								{(field) => (
									<span className="line-clamp-1 min-w-0 flex-1">
										{field.input}
									</span>
								)}
							</FormischField>
						</p>
					</>
				)}
			</FormischField>
		</div>
	);
}
