import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPEN_ROUTER_API_KEY;
if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is required");

export const openRouter = new OpenRouter({
	apiKey,
	appTitle: process.env.APP_TITLE,
	httpReferer: process.env.APP_URL,
});
