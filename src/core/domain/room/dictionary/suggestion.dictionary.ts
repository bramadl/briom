import { INTENT_OPTION, type IntentOption } from "@briom/domain/turn";

/**
 * @description
 * `ProposalDictionary` — Domain Service
 *
 * Generates rich, contextual microcopy for user orchestration actions.
 * Framed as "Participant readiness state" or "Action prompts for the Moderator".
 */
export const PROPOSAL_DICTIONARY = {
	[INTENT_OPTION.RESPOND]: {
		curious: [
			"See what {name} thinks",
			"Hear {name}'s perspective",
			"Ask {name} to weigh in",
			"Invite {name} into the discussion",
			"See how {name} responds",
			"Bring {name} into this thread",
		],

		assertive: [
			"Let {name} respond",
			"Give {name} the floor",
			"Ask {name} for their position",
			"Hear {name}'s take",
			"Continue with {name}",
			"Bring in {name}'s perspective",
		],

		reflective: [
			"{name} has been considering this",
			"{name} may have a perspective worth hearing",
			"{name} appears ready to weigh in",
			"{name} has been following the discussion",
			"See how {name} interprets this",
			"Hear {name}'s thoughts on the matter",
		],

		playful: [
			"{name} wants to jump in",
			"{name} has something to add",
			"{name} looks ready to respond",
			"{name} may have a different angle",
			"{name} seems eager to weigh in",
			"{name} has been waiting for a turn",
		],

		urgent: [
			"{name} needs to respond",
			"Don't move on without hearing {name}",
			"{name} has an important point",
			"{name} wants to address this",
			"{name} may be seeing something critical",
			"Hear {name} before continuing",
		],
	},

	[INTENT_OPTION.CRITIQUE]: {
		curious: [
			"Ask {name} to critique this",
			"See what concerns {name}",
			"Let {name} look for weaknesses",
			"Ask {name} to pressure-test the idea",
			"See what {name} questions",
			"Invite a critique from {name}",
		],

		assertive: [
			"Let {name} challenge the reasoning",
			"Ask {name} to identify flaws",
			"{name} sees a potential issue",
			"{name} may disagree with the approach",
			"{name} wants to stress-test this",
			"Hear {name}'s objections",
		],

		reflective: [
			"{name} sees some tension here",
			"{name} has concerns worth exploring",
			"{name} may spot a blind spot",
			"{name} is questioning part of the reasoning",
			"{name} sees room for improvement",
			"{name} may have reservations",
		],

		playful: [
			"{name} wants to play devil's advocate",
			"{name} spotted a possible flaw",
			"{name} isn't fully convinced",
			"{name} has a counterpoint",
			"{name} may challenge the consensus",
			"{name} sees something worth debating",
		],

		urgent: [
			"{name} sees a serious issue",
			"{name} wants to challenge this immediately",
			"{name} thinks we're overlooking something",
			"{name} has a critical concern",
			"{name} spotted a major weakness",
			"Pause — {name} may have found a flaw",
		],
	},

	[INTENT_OPTION.EXPAND]: {
		curious: [
			"Ask {name} to expand on this",
			"See how {name} develops the idea",
			"Invite {name} to go deeper",
			"Ask {name} for more detail",
			"Let {name} build on this thought",
			"Explore this further with {name}",
		],

		assertive: [
			"Let {name} take this further",
			"{name} has more to add",
			"Ask {name} to elaborate",
			"See where {name} takes this next",
			"{name} can deepen the discussion",
			"Continue exploring with {name}",
		],

		reflective: [
			"{name} sees another layer here",
			"{name} wants to go deeper",
			"{name} has additional context",
			"{name} can add more nuance",
			"{name} sees a broader picture",
			"{name} may uncover something useful",
		],

		playful: [
			"{name} isn't finished yet",
			"{name} has another idea",
			"{name} found an interesting thread",
			"{name} wants to keep digging",
			"{name} sees where this could go",
			"{name} has more connections to make",
		],

		urgent: [
			"{name} thinks something important is missing",
			"{name} has critical context to add",
			"Don't move on before hearing {name}",
			"{name} wants to expand on a key point",
			"{name} sees an overlooked detail",
			"{name} has more information that matters",
		],
	},

	[INTENT_OPTION.CHALLENGE]: {
		curious: [
			"Ask {name} to challenge the premise",
			"See what assumptions {name} questions",
			"Invite {name} to push back",
			"Ask {name} for a counter-perspective",
			"See where {name} disagrees",
			"Let {name} challenge the direction",
		],

		assertive: [
			"{name} wants to challenge this",
			"{name} questions the conclusion",
			"{name} isn't convinced",
			"{name} sees an alternative path",
			"{name} wants to test the assumptions",
			"Hear {name}'s challenge",
		],

		reflective: [
			"{name} sees a deeper assumption",
			"{name} is questioning the foundation",
			"{name} may view this differently",
			"{name} wants to explore another interpretation",
			"{name} has doubts about the direction",
			"{name} is testing the underlying logic",
		],

		playful: [
			"{name} wants to shake things up",
			"{name} has a different take",
			"{name} isn't buying it yet",
			"{name} wants to ask 'why?'",
			"{name} sees another possibility",
			"{name} is ready to push back",
		],

		urgent: [
			"{name} believes this needs to be challenged",
			"{name} sees a fundamental issue",
			"{name} thinks we're heading the wrong way",
			"{name} wants an immediate rethink",
			"{name} questions the current direction",
			"Stop — {name} sees a major assumption worth testing",
		],
	},

	[INTENT_OPTION.SUMMARIZE]: {
		curious: [
			"Ask {name} to summarize",
			"See how {name} connects the discussion",
			"Invite {name} to synthesize the ideas",
			"Ask {name} for a recap",
			"See what patterns {name} sees",
			"Let {name} connect the dots",
		],

		assertive: [
			"Let {name} summarize where we stand",
			"Ask {name} to synthesize the discussion",
			"{name} can connect the threads",
			"{name} sees the bigger picture",
			"{name} can align the perspectives",
			"Hear {name}'s synthesis",
		],

		reflective: [
			"{name} has been piecing things together",
			"{name} sees a common thread",
			"{name} may help clarify the discussion",
			"{name} can bring everything together",
			"{name} sees how the ideas connect",
			"{name} has a synthesis forming",
		],

		playful: [
			"{name} can make sense of the chaos",
			"{name} sees the pattern",
			"{name} might connect the missing pieces",
			"{name} can tie this together",
			"{name} sees how it all fits",
			"{name} is ready to connect the dots",
		],

		urgent: [
			"{name} thinks we need alignment",
			"{name} can help clarify where we stand",
			"{name} sees a need for synthesis",
			"Before continuing, hear {name}'s summary",
			"{name} can reconnect the discussion",
			"{name} wants to bring the room back into focus",
		],
	},

	[INTENT_OPTION.DIRECT]: {
		curious: [
			"Ask {name} directly",
			"Hear {name}'s take",
			"See {name}'s perspective",
			"Ask for {name}'s opinion",
			"Get {name}'s view",
			"Hear from {name}",
		],

		assertive: [
			"Let {name} answer directly",
			"Ask {name} for a clear position",
			"Hear {name}'s answer",
			"{name} has a direct response",
			"{name} has a clear opinion",
			"Get {name}'s position",
		],

		reflective: [
			"{name} has been thinking about this",
			"{name} may have a straightforward answer",
			"{name} sees a clear path forward",
			"{name} has a measured perspective",
			"{name} can answer directly",
			"{name} has a grounded take",
		],

		playful: [
			"{name} wants to be blunt",
			"{name} has a straightforward take",
			"{name} is ready to answer",
			"{name} has a simple answer",
			"{name} wants to get to the point",
			"{name} sees it differently",
		],

		urgent: [
			"{name} has an immediate answer",
			"{name} wants to address this directly",
			"{name} sees a clear next step",
			"{name} thinks a direct response is needed",
			"{name} has a practical answer",
			"Hear {name}'s answer before continuing",
		],
	},
} as const;

/**
 * @description
 * Selects a proposal label based on intent, mood, and randomness.
 */
const recentlyUsedLabels = new Set<string>();
export function selectProposalLabel(
	intent: IntentOption,
	participantName: string,
	mood:
		| "curious"
		| "assertive"
		| "reflective"
		| "playful"
		| "urgent" = "curious",
): string {
	const entries = PROPOSAL_DICTIONARY[intent][mood];
	const candidates = entries.filter((entry) => !recentlyUsedLabels.has(entry));
	const pool = candidates.length > 0 ? candidates : entries;
	const selected = pool[Math.floor(Math.random() * pool.length)];

	recentlyUsedLabels.add(selected);
	if (recentlyUsedLabels.size > 20) recentlyUsedLabels.clear();
	return selected.replace("{name}", participantName);
}

/**
 * @description
 * Selects mood based on context.
 */
export function selectMood(context: {
	turnCount: number;
	hasFailedTurn: boolean;
	lastIntent?: IntentOption;
	participantCount: number;
}): "curious" | "assertive" | "reflective" | "playful" | "urgent" {
	if (context.hasFailedTurn) return "urgent";
	if (context.lastIntent === "challenge" || context.lastIntent === "critique") {
		return "assertive";
	} else if (context.participantCount > 2 && context.turnCount > 5) {
		return "reflective";
	}

	if (context.turnCount > 8) return "playful";
	return "curious";
}
