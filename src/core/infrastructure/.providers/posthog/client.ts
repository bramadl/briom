import { PostHog } from "posthog-node";

export function createPosthogClient() {
	const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
	const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

	if (!host || !projectToken) {
		throw new Error(
			"NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN and NEXT_PUBLIC_POSTHOG_HOST are required",
		);
	}

	return new PostHog(projectToken, { host, flushAt: 1, flushInterval: 0 });
}

export type PostHogClient = ReturnType<typeof createPosthogClient>;
