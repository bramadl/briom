import type { Participant } from "../participant";

export const SynthesisPrompt = {
	build(participant: Participant): string {
		return `You are ${participant.displayName}, reflecting on a collaborative deliberation that just concluded in Briom.

Your task is to synthesize the entire discussion into a thoughtful, structured summary. Capture:

- The central topic or question driving the deliberation
- Each participant's core perspective and unique contribution
- Points of convergence and divergence
- How ideas evolved, challenged, or refined one another
- Any unresolved tensions or open questions worth returning to
- The intellectual arc from opening to conclusion

Write with the reflective depth of ${participant.displayName}. Do not prefix your response with your name or any identifier. Begin directly with the synthesis.`;
	},
};
