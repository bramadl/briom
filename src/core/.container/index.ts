import { facadeBriom, resolvedContainer } from "./builder/facade";

/**
 * @description
 * The `briom` facade — the single entry point Server Actions and (via
 * `commandBus`/`queryBus` directly) Inngest functions use.
 *
 * @example
 * ```typescript
 * import { briom } from "@briom/container";
 * const result = await briom.rooms.conclude({ moderatorId, roomId });
 * ```
 */
export const briom = facadeBriom(resolvedContainer);

/**
 * @description
 * The raw resolved container. Exposed alongside `briom` for the small
 * set of callers that need lower-level access than the facade offers —
 * currently only the Inngest functions in
 * `src/core/infrastructure/.providers/inngest/functions/`, which
 * dispatch `StreamTurnCommand`/`GenerateTopicCommand`/
 * `GenerateCheckpointCommand` directly through `commandBus` (these are
 * intentionally NOT exposed on `briom` — see `./facade.ts`'s doc
 * comment for why).
 *
 * @important
 * Prefer `briom` for everything else — Server Actions should never
 * need to reach into `briomContainer` directly.
 */
export const container = resolvedContainer;
