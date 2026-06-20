import { INTENT_OPTION, type IntentOption } from "@briom/domain/turn";

/**
 * @description
 * `ProposalDictionary` — Domain Service
 *
 * Generates rich, contextual, non-robotic labels for turn proposals.
 * Each intent has multiple dictionaries (mood × context) to ensure
 * variety and "alive" feeling.
 *
 * **Why Not Static?**
 * Static labels feel mechanical after 3-4 repetitions.
 * Dynamic labels create the sense that participants have
 * genuine agency and personality.
 *
 * **Mood Categories**
 * - Curious: questioning, open-ended
 * - Assertive: confident, direct
 * - Reflective: thoughtful, measured
 * - Playful: slightly irreverent, unexpected
 * - Urgent: time-sensitive, pressing
 */
export const PROPOSAL_DICTIONARY = {
	[INTENT_OPTION.RESPOND]: {
		curious: [
			"What would {name} say to this?",
			"{name} seems ready to weigh in",
			"Let {name} share their perspective",
			"Curious what {name} thinks here",
			"{name} might have a different angle",
			"Hear {name} out on this one",
			"{name} probably has thoughts brewing",
			"What angle does {name} see?",
			"{name} could shed light on this",
			"Let {name} enter the conversation",
			"Time for {name}'s take",
			"{name} might surprise us here",
			"See what {name} brings to the table",
			"{name} has been quiet — let's hear it",
			"What does {name} make of all this?",
		],
		assertive: [
			"{name} wants to respond",
			"Let {name} step in",
			"{name} has something to say",
			"Give {name} the floor",
			"{name} is ready to contribute",
			"{name} demands attention here",
			"Time for {name} to speak up",
			"{name} won't stay silent on this",
			"Let {name} make their case",
			"{name} has a strong view on this",
		],
		reflective: [
			"{name} might offer a measured response",
			"A thoughtful reply from {name}?",
			"{name} tends to see the nuance",
			"Let {name} reflect on this",
			"{name} usually takes their time",
			"Hear {name}'s careful perspective",
			"{name} might find the middle ground",
			"What would {name} consider carefully?",
			"{name} often sees what others miss",
			"Let {name} ponder and respond",
		],
		playful: [
			"{name} is itching to jump in",
			"Oh, {name} definitely has opinions",
			"{name} can't hold back anymore",
			"Here comes {name}...",
			"{name} is about to stir things up",
			"Brace for {name}'s hot take",
			"{name} has been waiting for this",
			"Plot twist: {name} responds",
			"{name} enters the chat (literally)",
			"And now, a word from {name}",
		],
		urgent: [
			"{name} needs to address this now",
			"Critical: hear {name} out",
			"{name} must respond urgently",
			"Don't proceed without {name}",
			"{name} has a pressing concern",
			"Immediate input needed from {name}",
			"{name} flagged this — let's hear why",
			"Stop — {name} has something critical",
			"{name} won't let this slide",
			"Urgent perspective from {name}",
		],
	},

	[INTENT_OPTION.CRITIQUE]: {
		curious: [
			"What would {name} challenge here?",
			"{name} might spot a flaw",
			"Would {name} push back on this?",
			"What gap does {name} see?",
			"{name} probably has questions",
			"Let {name} probe the weaknesses",
			"What would {name} disagree with?",
			"{name} might test this logic",
			"See where {name} finds friction",
			"What does {name} think is missing?",
		],
		assertive: [
			"{name} wants to challenge this",
			"Let {name} tear this apart",
			"{name} has serious doubts",
			"{name} fundamentally disagrees",
			"This won't stand with {name}",
			"{name} sees a critical flaw",
			"Let {name} dismantle this",
			"{name} rejects this premise",
			"Strong objection from {name}",
			"{name} calls this into question",
		],
		reflective: [
			"{name} might gently challenge this",
			"A softer critique from {name}?",
			"{name} sees the tension",
			"What would {name} question carefully?",
			"{name} finds this incomplete",
			"Let {name} offer a counterpoint",
			"{name} sees another side",
			"What nuance does {name} add?",
			"{name} respects but disagrees",
			"A thoughtful pushback from {name}",
		],
		playful: [
			"{name} is about to ruin everything (in a good way)",
			"Oh no, {name} is skeptical",
			"Here comes {name}'s devil's advocate",
			"{name} is not having it",
			"Plot twist: {name} disagrees",
			"{name} says 'actually...'",
			"Someone call {name}, they need to see this",
			"{name} is about to complicate things",
			"And now, {name} ruins the vibe",
			"{name} enters with a red pen",
		],
		urgent: [
			"{name} must challenge this immediately",
			"Critical flaw spotted by {name}",
			"{name} cannot let this stand",
			"Urgent: {name} needs to object",
			"Stop — {name} found a problem",
			"{name} demands reconsideration",
			"This fails {name}'s scrutiny",
			"{name} raises a red flag",
			"Critical input from {name}",
			"{name} will not accept this",
		],
	},

	[INTENT_OPTION.EXPAND]: {
		curious: [
			"What else would {name} add?",
			"{name} might go deeper",
			"Where does {name} take this next?",
			"What dimension does {name} see?",
			"{name} probably sees more layers",
			"Let {name} stretch this further",
			"What else is here, {name}?",
			"{name} might find hidden depth",
			"See where {name} expands this",
			"What would {name} explore further?",
		],
		assertive: [
			"{name} wants to expand this",
			"Let {name} take this further",
			"{name} sees more to unpack",
			"{name} demands deeper exploration",
			"This needs {name}'s elaboration",
			"Let {name} build on this",
			"{name} has more to say",
			"Expand this with {name}",
			"{name} won't leave it here",
			"Let {name} push this boundary",
		],
		reflective: [
			"{name} might add thoughtful depth",
			"A richer perspective from {name}?",
			"{name} sees the bigger picture",
			"What would {name} elaborate gently?",
			"{name} finds more to consider",
			"Let {name} add their dimension",
			"{name} sees what lies beneath",
			"What depth does {name} bring?",
			"{name} often finds the layers",
			"Let {name} unfold this slowly",
		],
		playful: [
			"{name} is about to go off",
			"Oh, {name} has MORE thoughts",
			"{name} won't stop at the surface",
			"Here comes {name}'s deep dive",
			"{name} is just getting started",
			"Buckle up, {name} expands",
			"{name} sees ten more things",
			"And now, {name} goes philosophical",
			"{name} is about to overthink this",
			"Deep breath, {name} elaborates",
		],
		urgent: [
			"{name} must expand on this now",
			"Critical depth needed from {name}",
			"Don't miss {name}'s elaboration",
			"{name} has urgent additions",
			"Immediate expansion from {name}",
			"{name} sees what's missing",
			"This needs {name}'s full picture",
			"Urgent: {name} adds context",
			"{name} demands more exploration",
			"Critical elaboration from {name}",
		],
	},

	[INTENT_OPTION.CHALLENGE]: {
		curious: [
			"What would {name} question?",
			"{name} might ask 'why?'",
			"Would {name} challenge the premise?",
			"What assumption does {name} test?",
			"{name} probably sees a blind spot",
			"Let {name} ask the hard questions",
			"What would {name} push back on?",
			"{name} might challenge the foundation",
			"See what {name} dares to question",
			"What does {name} think is wrong?",
		],
		assertive: [
			"{name} wants to challenge this",
			"Let {name} question everything",
			"{name} rejects the premise",
			"{name} demands justification",
			"This doesn't hold for {name}",
			"Let {name} challenge the core",
			"{name} sees fundamental issues",
			"Challenge accepted by {name}",
			"{name} questions the foundation",
			"Let {name} be the skeptic",
		],
		reflective: [
			"{name} might gently challenge",
			"A thoughtful question from {name}?",
			"{name} sees the weak link",
			"What would {name} probe carefully?",
			"{name} finds the gap",
			"Let {name} ask the quiet question",
			"{name} sees what's assumed",
			"What doubt does {name} raise?",
			"{name} often finds the crack",
			"Let {name} question with care",
		],
		playful: [
			"{name} is about to ask 'but why?'",
			"Oh, {name} is in questioning mode",
			"{name} won't accept the premise",
			"Here comes {name}'s skepticism",
			"{name} says 'hold up'",
			"Plot twist: {name} asks questions",
			"{name} is about to complicate this",
			"Someone stop {name} from asking",
			"And now, {name} goes Socratic",
			"{name} enters with doubt",
		],
		urgent: [
			"{name} must challenge this now",
			"Critical questions from {name}",
			"Stop — {name} sees a problem",
			"{name} demands answers urgently",
			"This fails {name}'s test",
			"{name} cannot accept this",
			"Urgent challenge from {name}",
			"{name} questions the foundation",
			"Critical doubt from {name}",
			"{name} rejects this urgently",
		],
	},

	[INTENT_OPTION.SUMMARIZE]: {
		curious: [
			"What would {name} synthesize?",
			"{name} might connect the dots",
			"Let {name} find the pattern",
			"What thread does {name} see?",
			"{name} probably sees the arc",
			"Let {name} weave this together",
			"What story does {name} tell?",
			"{name} might find the throughline",
			"See how {name} connects this",
			"What does {name} make of it all?",
		],
		assertive: [
			"{name} wants to summarize",
			"Let {name} tie this together",
			"{name} sees the big picture",
			"{name} demands synthesis",
			"This needs {name}'s summary",
			"Let {name} find the conclusion",
			"{name} connects the threads",
			"Synthesize this with {name}",
			"{name} sees where this lands",
			"Let {name} wrap this up",
		],
		reflective: [
			"{name} might offer a quiet summary",
			"A measured synthesis from {name}?",
			"{name} sees the whole",
			"What would {name} conclude gently?",
			"{name} finds the common thread",
			"Let {name} reflect on all this",
			"{name} sees the journey",
			"What pattern does {name} see?",
			"{name} often finds the meaning",
			"Let {name} gather the pieces",
		],
		playful: [
			"{name} is about to connect the dots",
			"Oh, {name} sees the pattern",
			"{name} is the plot summarizer",
			"Here comes {name}'s TL;DR",
			"{name} is about to make sense of chaos",
			"Buckle up, {name} synthesizes",
			"{name} sees what we missed",
			"And now, {name} goes meta",
			"{name} is about to overarch",
			"Plot twist: {name} summarizes",
		],
		urgent: [
			"{name} must summarize now",
			"Critical synthesis from {name}",
			"Don't proceed without {name}'s summary",
			"{name} sees the urgent pattern",
			"Immediate synthesis needed",
			"{name} demands we look back",
			"This needs {name}'s conclusion",
			"Urgent: {name} ties this together",
			"{name} sees the critical arc",
			"Stop and hear {name}'s summary",
		],
	},

	[INTENT_OPTION.DIRECT]: {
		curious: [
			"What would {name} say directly?",
			"{name} might respond straight",
			"Let {name} address this head-on",
			"What does {name} think plainly?",
			"{name} probably has a clear view",
			"Let {name} speak directly",
			"What would {name} say plainly?",
			"{name} might cut through the noise",
			"See {name}'s direct take",
			"What does {name} say without filter?",
		],
		assertive: [
			"{name} wants to respond directly",
			"Let {name} speak plainly",
			"{name} has a direct answer",
			"{name} cuts to the chase",
			"Direct response from {name}",
			"Let {name} be blunt",
			"{name} speaks clearly",
			"Hear {name}'s straight take",
			"{name} doesn't mince words",
			"Let {name} respond directly",
		],
		reflective: [
			"{name} might respond with care",
			"A direct but gentle word from {name}?",
			"{name} sees the simple truth",
			"What would {name} say plainly?",
			"{name} finds the clear path",
			"Let {name} speak their mind",
			"{name} often sees clearly",
			"What direct insight from {name}?",
			"{name} responds with honesty",
			"Let {name} be straightforward",
		],
		playful: [
			"{name} is about to be direct",
			"Oh, {name} doesn't do subtle",
			"{name} speaks their truth",
			"Here comes {name}'s hot take",
			"{name} is about to be real",
			"Buckle up, {name} is direct",
			"{name} cuts through the BS",
			"And now, {name} keeps it 100",
			"{name} enters with no filter",
			"Direct mode: {name}",
		],
		urgent: [
			"{name} must respond now",
			"Direct and urgent from {name}",
			"Critical direct response needed",
			"{name} has urgent clarity",
			"Immediate word from {name}",
			"{name} demands to speak",
			"Don't wait for {name}",
			"Urgent direct take from {name}",
			"{name} sees clearly and urgently",
			"Critical direct input from {name}",
		],
	},
} as const;

/**
 * @description
 * Selects a proposal label based on intent, mood, and randomness.
 */
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
	const dictionary = PROPOSAL_DICTIONARY[intent];
	const entries = dictionary[mood];
	const randomIndex = Math.floor(Math.random() * entries.length);
	return entries[randomIndex].replace("{name}", participantName);
}

/**
 * @description
 * Selects mood based on context:
 * - Urgent: if discussion is heated or failed turn
 * - Playful: if light tone or first few turns
 * - Assertive: if strong disagreement exists
 * - Reflective: if complex, nuanced topic
 * - Curious: default
 */
export function selectMood(context: {
	turnCount: number;
	hasFailedTurn: boolean;
	lastIntent?: IntentOption;
	participantCount: number;
}): "curious" | "assertive" | "reflective" | "playful" | "urgent" {
	if (context.hasFailedTurn) return "urgent";
	if (context.turnCount < 3) return "playful";

	if (context.lastIntent === "challenge" || context.lastIntent === "critique") {
		return "assertive";
	} else if (context.participantCount > 2 && context.turnCount > 5) {
		return "reflective";
	}

	return "curious";
}
