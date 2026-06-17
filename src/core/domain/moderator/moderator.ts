import { type DomainError, Entity, validator as v } from "@briom/libs/drimion";

import { EmptyModeratorDisplayNameError } from "./errors";
import type { ModeratorId } from "./moderator.id";

interface ModeratorProps {
	displayName: string;
	email: string;
	id: ModeratorId;
}

export class Moderator extends Entity<ModeratorProps> {
	private constructor(props: ModeratorProps) {
		super(props);
	}

	public static override isValidProps(
		props: ModeratorProps,
	): DomainError | undefined {
		if (v.string(props.displayName).isEmpty()) {
			return new EmptyModeratorDisplayNameError();
		}
		return undefined;
	}

	public get displayName(): string {
		return this.get("displayName");
	}

	public get email(): string {
		return this.get("email");
	}
}
