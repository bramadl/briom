import type { ApplicationError, IResult } from "@drimion";

/**
 * @description
 * Plain, serializable shape of an ApplicationError, safe to return
 * across the Server Action boundary. Next.js can only serialize plain
 * data through the RSC wire format — throwing a class instance gets
 * stripped down to an opaque generic error, which is why this exists
 * as a flat object instead.
 */
export interface SerializedApplicationError {
	code?: string;
	message: string;
}

export type ActionResult<T, M = unknown> =
	| { success: true; data: T; metaData: M }
	| { success: false; error: SerializedApplicationError };

function serializeError(error: ApplicationError): SerializedApplicationError {
	return {
		code: error.code,
		message: error.message,
	};
}

/**
 * @description
 * Converts an `IResult` (from a command/query bus handler) into a
 * plain, serializable union — safe to `return` directly from a Server
 * Action. Never throws.
 *
 * The Server Action itself stays a pure "did it work or not" boundary;
 * turning a failure into a thrown error (so React Query's `error` state
 * / Suspense error boundaries pick it up) is the caller's job — see
 * `unwrap()`.
 */
export function respond<T, E extends ApplicationError, M = unknown>(
	result: IResult<T, E, M>,
): ActionResult<T, M> {
	if (result.isError()) {
		return { success: false, error: serializeError(result.error()) };
	}

	return {
		success: true,
		data: result.value(),
		metaData: result.metaData(),
	};
}

/**
 * @description
 * Client/query-layer counterpart to `respond`. Takes the plain
 * `ActionResult` a Server Action returned and, if it represents a
 * failure, throws — this is the ONE place in the data flow where
 * throwing is correct, since this runs inside a `queryFn` (or wherever
 * React Query / a Suspense boundary expects a rejected promise to
 * represent failure).
 *
 * @note
 * Deliberately throws a plain `Error` (not `ApplicationError`) here,
 * since we're back on the client by this point and don't need the
 * richer server-side error type — `error.message` is enough for
 * toasts/error boundaries. If callers need `code` too, extend this.
 */
export function unwrap<T, M = unknown>(
	result: ActionResult<T, M>,
): { data: T; metaData: M } {
	if (!result.success) {
		throw new Error(result.error.message, { cause: result.error });
	}

	return { data: result.data, metaData: result.metaData };
}
