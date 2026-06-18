export const THINKING_MESSAGES = [
	{ threshold: 0, text: (name: string) => `${name} is thinking` },
	{ threshold: 30000, text: (name: string) => `${name} is thinking deeply` },
	{
		threshold: 60000,
		text: (name: string) => `${name} is weighing the perspectives`,
	},

	{
		threshold: 90000,
		text: (name: string) =>
			`${name} is taking its time — good ideas need space`,
	},

	{
		threshold: 120000,
		text: (name: string) =>
			`${name} is still reasoning... some threads take longer to untangle`,
	},

	{
		threshold: 180000,
		text: (name: string) =>
			`${name} is working through it — free models are thoughtful, not fast`,
	},

	{
		threshold: 300000,
		text: (name: string) =>
			`${name} is thinking hard. Perhaps too hard. We believe in it.`,
	},
];

export const CONNECTING_MESSAGES = [
	{
		threshold: 0,
		text: (name: string) => `${name} is about to reply`,
	},
	{ threshold: 15000, text: (name: string) => `Reaching ${name} once again` },
	{
		threshold: 30000,
		text: (name: string) => `Still connecting to ${name} — the line is open`,
	},
];

export const STREAMING_MESSAGES = [
	{ threshold: 0, text: (name: string) => `${name} is responding` },
];

export function getMessage(
	name: string,
	messages: Array<{ threshold: number; text: (name: string) => string }>,
	elapsed: number,
): string {
	let selected = messages[0];
	for (const msg of messages) {
		if (elapsed >= msg.threshold) {
			selected = msg;
		}
	}
	return selected.text(name);
}
