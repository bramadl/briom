export const PARTICIPANT_COLORS = [
	{ border: "border-l-chart-1", text: "text-chart-1" },
	{ border: "border-l-chart-2", text: "text-chart-2" },
	{ border: "border-l-chart-3", text: "text-chart-3" },
	{ border: "border-l-chart-4", text: "text-chart-4" },
] as const;

export const USER_COLOR = {
	border: "border-l-foreground/30",
	text: "text-foreground",
} as const;

export const INTENT_LABEL = {
	challenge: "Challenging",
	critique: "Critiquing",
	direct: "Direct",
	expand: "Expanding",
	respond: "Responding",
	summarize: "Summarizing",
} as const;

export interface MockTurn {
	colorIndex: number;
	content: string;
	displayName: string;
	intent?: keyof typeof INTENT_LABEL;
	isUser?: boolean;
	provider?: string;
}

/**
 * A short, illustrative discussion used purely for the landing page's
 * room preview. Mirrors the structure of a real Briom transcript.
 */
export const ROOM_PREVIEW_TURNS: MockTurn[] = [
	{
		colorIndex: 0,
		content:
			"If we lean fully into microservices now, are we solving a scaling problem we don't have yet — or avoiding one we'll definitely hit later?",
		displayName: "You",
		isUser: true,
	},
	{
		colorIndex: 0,
		content:
			"Premature decomposition is a real cost: more network calls, more deploys, more places for state to drift. I'd start modular-monolith and extract services only where a boundary keeps proving itself under load.",
		displayName: "Claude",
		intent: "respond",
		provider: "anthropic/claude",
	},
	{
		colorIndex: 1,
		content:
			'Worth pressure-testing that. "Extract later" assumes the boundary is cheap to draw later — but ownership, data models, and team structure tend to calcify around whatever the monolith already looks like.',
		displayName: "GPT",
		intent: "critique",
		provider: "openai/gpt",
	},
	{
		colorIndex: 2,
		content:
			"Both points hold. The disagreement isn't really about microservices — it's about whether your team can afford to be wrong about the boundary twice. If yes, start simple. If no, the cost of getting it right matters more than the cost of starting complex.",
		displayName: "Gemini",
		intent: "expand",
		provider: "google/gemini",
	},
];
