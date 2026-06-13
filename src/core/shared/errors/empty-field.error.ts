import { DomainError } from "@briom/drimion";

export class EmptyFieldError extends DomainError {
	constructor(option: { context?: string; field?: string }) {
		super(`field cannot be empty`, {
			context: option.context,
			field: option.field,
		});
	}
}
