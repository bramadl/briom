import type { ILogger, LogContext } from "@briom/core/app";
import pino, { type Logger as PinoInstance } from "pino";

export class PinoLogger implements ILogger {
	private readonly logger: PinoInstance;

	public constructor() {
		const isDev = process.env.NODE_ENV !== "production";

		this.logger = pino({
			level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
			...(isDev && {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss",
						ignore: "pid,hostname",
					},
				},
			}),
		});
	}

	public error(message: string, context?: LogContext): void {
		this.logger.error(context ?? {}, message);
	}

	public info(message: string, context?: LogContext): void {
		this.logger.info(context ?? {}, message);
	}

	public warn(message: string, context?: LogContext): void {
		this.logger.warn(context ?? {}, message);
	}
}
