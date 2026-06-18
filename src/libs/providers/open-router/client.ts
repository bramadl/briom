import { OpenRouter } from "@openrouter/sdk";

/**
 * @description
 * OpenRouter API key from environment.
 *
 * Required for LLM streaming. Throws if missing.
 */
const apiKey = process.env.OPEN_ROUTER_API_KEY;
if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is required");

/**
 * @description
 * OpenRouter SDK client instance.
 *
 * Pre-configured with API key and optional app metadata for provider analytics.
 * This is the raw SDK client — the gateway adapter wraps it for domain compatibility.
 *
 * @see OpenRouterLlmGateway — domain adapter wrapping this client
 */
export const openRouter = new OpenRouter({
	apiKey,
	appTitle: process.env.APP_TITLE,
	httpReferer: process.env.APP_URL,
});
