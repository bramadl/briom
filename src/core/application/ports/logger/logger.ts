/**
 * @description
 * Structured context attached to a log line — arbitrary but should stay
 * JSON-serializable, since most log sinks (stdout on Vercel, Sentry
 * breadcrumbs, Logtail/Axiom later) expect structured JSON, not
 * interpolated strings.
 */
export type LogContext = Record<string, unknown>;

/**
 * @description
 * Port to technical/error logging — distinct from IAnalyticsTracker.
 * This is for *you* debugging the system (exceptions, unexpected
 * states, provider failures); IAnalyticsTracker is for understanding
 * *user* behavior. They will likely point at different tools even
 * though both eventually route through observability infra.
 *
 * Implementations should be effectively synchronous / non-blocking
 * from the caller's perspective (e.g. pino writes to stdout immediately;
 * Sentry's SDK queues internally) — unlike IAnalyticsTracker, callers
 * are not expected to schedule these via after().
 */
export interface ILogger {
	/**
	 * @description
	 * An exception or failure that broke an operation — the caller
	 * already handled it gracefully (e.g. failAndRelease ran), but it's
	 * worth knowing this happened.
	 */
	error(message: string, context?: LogContext): void;

	/**
	 * @description
	 * Notable lifecycle events worth having in the trail during
	 * debugging, but not actionable on their own.
	 */
	info(message: string, context?: LogContext): void;

	/**
	 * @description
	 * Something unexpected but non-fatal — e.g. a fallback path was
	 * taken, or a provider omitted usage reporting.
	 */
	warn(message: string, context?: LogContext): void;
}
