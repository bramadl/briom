import { eventType, staticSchema } from "inngest";

/**
 * @see ITurnGenerator.enqueue.params
 * `src/core/application/ports/generators/turn.generator.ts`
 */
export const generateTurnTrigger = eventType("turn/generation.requested", {
	schema: staticSchema<{ roomId: string; turnId: string }>(),
});

/**
 * @see ITopicGenerator.enqueue.params -
 * `src/core/application/ports/generators/topic.generator.ts`
 */
export const generateTopicTrigger = eventType("topic/generation.requested", {
	schema: staticSchema<{ roomId: string; seedContent: string }>(),
});

export const generateCheckpointTrigger = eventType(
	"checkpoint/generation.requested",
	/**
	 * @see ICheckpointGenerator.enqueue.params -
	 * `src/core/application/ports/generators/checkpoint.generator.ts`
	 */
	{ schema: staticSchema<{ roomId: string }>() },
);
