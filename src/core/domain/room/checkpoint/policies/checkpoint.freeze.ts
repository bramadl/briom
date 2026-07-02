/**
 * @description
 * Decides whether a Free-tier moderator's room should freeze
 * immediately after a checkpoint is generated.
 *
 * Power users (positive Briom Credit balance) are exempt — checkpoints
 * just keep their context bounded without interrupting deliberation.
 * Free-tier moderators hit a hard stop on their very first checkpoint,
 * resolved by topping up credit.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainPolicy>
export class CheckpointFreezePolicy {
	public static readonly FREEZE_REASON =
		"You've reached your first checkpoint. Top up Briom Credit to keep this room deliberating.";

	public static shouldFreeze(isPowerUser: boolean): boolean {
		return !isPowerUser;
	}
}
