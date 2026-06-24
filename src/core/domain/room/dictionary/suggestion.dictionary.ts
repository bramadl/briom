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
			"See how {name} would anchor this?",
			"Allow {name} to introduce their angle?",
			"Let {name} parse the current state?",
			"Curious to see {name}'s framing here?",
			"Want {name} to unpack their thoughts?",
			"Bring {name} into the foundation?",
			"See which way {name} leans toward?",
			"Let {name} weigh the options?",
			"Is {name} tracking a different inflection?",
			"Allow {name} to map this problem space?",
			"Time for {name} to anchor a view?",
			"Want to check {name}'s current position?",
			"Let {name} step into the trajectory?",
			"Hear what {name} has been brewing?",
			"Open the floor for {name}'s interpretation?",
		],
		assertive: [
			"{name} is ready to intervene",
			"Let {name} advance the position",
			"{name} has a clear stance to deposit",
			"Give {name} the floor to establish",
			"{name} is primed to drive the turn",
			"{name} demands analytical focus here",
			"Allow {name} to state their claim",
			"{name} is set to anchor a response",
			"Let {name} make their core case",
			"{name} holds a distinct conviction here",
		],
		reflective: [
			"{name} is preparing a tempered response",
			"Prompt a measured intervention from {name}?",
			"{name} is isolating the underlying nuance",
			"Let {name} deliberate on this layer",
			"Bring in {name}'s balanced perspective?",
			"Allow {name} to trace the middle ground?",
			"See what {name} uncovers upon reflection?",
			"{name} is tracking overlooked variables",
			"Let {name} internalize and react",
			"Deploy a calculated response from {name}?",
		],
		playful: [
			"{name} is hovering on an unconventional take",
			"{name} has a distinct reframe brewing",
			"Let {name} shake up the current consensus",
			"Bring in {name} with an alternative lens?",
			"{name} is ready to inject some friction",
			"Brace for {name}'s sharp interpretation",
			"Let {name} pivot the narrative direction",
			"Plot twist: pass the turn to {name}",
			"Allow {name} to complicate the premise?",
			"{name} is tracking a specific hidden thread",
		],
		urgent: [
			"{name} needs to address this immediately",
			"Critical intervention: let {name} speak",
			"{name} must respond to secure the logic",
			"Do not advance without {name}'s stance",
			"{name} signals a crucial clarification",
			"Immediate positioning needed from {name}",
			"{name} flags a missing setup — hear them out?",
			"Halt the drift: allow {name} to respond",
			"{name} won't let this baseline pass unanswered",
			"Deploy an indispensable response from {name}",
		],
	},

	[INTENT_OPTION.CRITIQUE]: {
		curious: [
			"Let {name} locate the structural friction?",
			"Will {name} spot an analytical blindspot?",
			"Want {name} to push back on these bounds?",
			"See what systemic gap {name} isolates?",
			"Allow {name} to probe the stress points?",
			"Let {name} cross-examine this sequence?",
			"See where {name} locates the structural strain?",
			"Want {name} to audit this formulation?",
			"Let {name} find what architecture is incomplete?",
			"See if {name} harbors methodological doubts?",
		],
		assertive: [
			"{name} is ready to audit this premise",
			"Let {name} dissect this formulation",
			"{name} presents explicit objections",
			"{name} is primed to contest this track",
			"This framework won't hold under {name}",
			"{name} targets a severe conceptual gap",
			"Let {name} dismantle the current consensus",
			"{name} explicitly rejects this absolute claim",
			"Review a formal objection from {name}",
			"{name} calls this entire branch into question",
		],
		reflective: [
			"{name} is prepared for a soft deconstruction",
			"Prompt a nuanced critique from {name}?",
			"{name} is isolating an inherent tension",
			"Let {name} question the boundaries gently",
			"Allow {name} to introduce a steady counterpoint",
			"See what layer of friction {name} adds?",
			"{name} respects the arc but doubts the execution",
			"Bring in a careful, diagnostic pushback from {name}?",
			"Let {name} track alternative limitations",
			"Allow {name} to review the thesis constraints?",
		],
		playful: [
			"{name} is ready to test the room's optimism",
			"{name} is entering as the devil's advocate",
			"Let {name} play the necessary contrarian",
			"{name} is refusing to subscribe to this baseline",
			"Plot twist: {name} found the catch",
			"Allow {name} to ask the inconvenient question?",
			"{name} is primed to break the echo chamber",
			"Let {name} enter with an intellectual red pen",
			"{name} is about to complicate this neat theory",
			"Let's see if {name} can rupture this consensus",
		],
		urgent: [
			"{name} must challenge this immediately",
			"Critical vulnerability exposed by {name}",
			"{name} cannot let this assumption solidify",
			"Urgent: {name} demands a structural audit",
			"Stop — {name} detects an invalid step",
			"{name} requires an immediate rollback of logic",
			"This path fails {name}'s standard of validation",
			"{name} raises a high-priority red flag",
			"Deploy a critical deconstruction from {name}",
			"{name} flags this as a terminal path",
		],
	},

	[INTENT_OPTION.EXPAND]: {
		curious: [
			"Let {name} extrapolate deeper vectors?",
			"Want {name} to take this down the rabbit hole?",
			"See where {name} maps the secondary effects?",
			"Allow {name} to unfold latent dimensions?",
			"Let {name} extend this baseline further?",
			"Want to see what lies beyond this horizon, {name}?",
			"See if {name} discovers a hidden tributary?",
			"Allow {name} to scale this hypothesis?",
			"Let {name} explore the broader macro landscape?",
			"See if {name} detects further systemic layers?",
		],
		assertive: [
			"{name} is ready to build out this domain",
			"Let {name} drive this idea to its limit",
			"{name} sees vast room for elaboration",
			"{name} demands a comprehensive drill-down",
			"This architecture requires {name}'s expansion",
			"Let {name} supercharge this thesis",
			"{name} holds extensive data to deposit",
			"Fortify this line of thought with {name}",
			"{name} won't let the thought stop halfway",
			"Allow {name} to enforce a broader scope",
		],
		reflective: [
			"{name} is prepared to contribute organic depth",
			"Prompt a multi-layered extension from {name}?",
			"Let {name} contextualize the broader ecosystem",
			"Allow {name} to unfold the details gently?",
			"{name} finds subtle ground to expand upon",
			"Let {name} add a sophisticated dimension",
			"See how {name} illuminates what lies beneath?",
			"Bring in the theoretical weight of {name}?",
			"Let {name} track long-term conceptual branches",
			"Allow {name} to develop this thought progressively?",
		],
		playful: [
			"{name} is poised to open a massive parenthesis",
			"{name} is just scratching the surface here",
			"Let {name} maximize the current analytical scope",
			"Bring in {name}'s deep architectural dive?",
			"{name} is getting warmed up to elaborate",
			"{name} sees ten adjacent connections right now",
			"Let {name} take the room into the abstract",
			"Allow {name} to extrapolate this beautifully?",
			"Prepare for a panoramic extension from {name}",
			"{name} refuses to leave this point so simple",
		],
		urgent: [
			"{name} must expand on this immediately",
			"Critical context missing — let {name} supply it",
			"Do not overlook {name}'s necessary elaboration",
			"{name} possesses urgent compounding insights",
			"Immediate domain expansion required from {name}",
			"{name} isolates what was dangerously omitted",
			"This thought requires {name}'s scale to survive",
			"Urgent: {name} must inject vital downstream parameters",
			"{name} demands a deeper dive before moving on",
			"Critical structural elaboration required from {name}",
		],
	},

	[INTENT_OPTION.CHALLENGE]: {
		curious: [
			"Let {name} test a foundational axiom?",
			"Will {name} ask the fundamental 'why?'",
			"Want {name} to shake the core framework?",
			"See what baseline constraint {name} disrupts?",
			"Allow {name} to force a defensive justification?",
			"Let {name} stress-test the entire premise?",
			"See what axioms {name} dares to dismantle?",
			"Want {name} to target an existential blindspot?",
			"Let {name} push against the anchor points?",
			"See what {name} perceives as a fundamental flaw?",
		],
		assertive: [
			"{name} is ready to challenge this entire vector",
			"Let {name} cross-examine every variable",
			"{name} completely rejects this direction",
			"{name} demands a rigorous defense of this claim",
			"This model configuration does not satisfy {name}",
			"Let {name} destabilize the core argument",
			"{name} isolates terminal inconsistencies here",
			"Initiate a structural challenge via {name}",
			"{name} targets the very root of this stance",
			"Let {name} act as the ultimate analytical filter",
		],
		reflective: [
			"{name} is mounting a quiet challenge",
			"Prompt a philosophical subversion from {name}?",
			"{name} is tracking down a structural fissure",
			"Let {name} test the components with care",
			"Allow {name} to present a subtle paradox?",
			"{name} challenges the unstated assumptions here",
			"See what underlying doubt {name} raises?",
			"Let {name} target an institutional gap in logic",
			"Allow {name} to question our current destination?",
			"Bring in {name}'s careful baseline interrogation?",
		],
		playful: [
			"{name} is ready to ask the ultimate 'so what?'",
			"{name} is entering pure interrogation mode",
			"Let {name} dial the discussion back to step one",
			"{name} is not buying this baseline at all",
			"Plot twist: let {name} upend the status quo",
			"{name} is poised to complicate our neat horizon",
			"Prepare a defense: {name} is highly skeptical",
			"Allow {name} to go fully Socratic here?",
			"Let {name} introduce a radical counter-hypothesis",
			"{name} is waiting to destabilize the mood",
		],
		urgent: [
			"{name} must challenge this trajectory now",
			"Existential challenge incoming from {name}",
			"Stop — {name} detects a fatal direction",
			"{name} demands immediate justification for this turn",
			"This path fails {name}'s primary validation",
			"{name} cannot allow this thesis to stand",
			"Urgent core challenge initiated by {name}",
			"{name} forces an immediate review of constraints",
			"Critical systemic doubt flagged by {name}",
			"{name} rejects this framework categorically",
		],
	},

	[INTENT_OPTION.SUMMARIZE]: {
		curious: [
			"Let {name} build an overarching taxonomy?",
			"Want {name} to synthesize these divergent paths?",
			"Allow {name} to extract the master pattern?",
			"See what common thread {name} observes?",
			"Let {name} map these perspectives together?",
			"Want {name} to isolate the exact convergence?",
			"See how {name} consolidates this deliberation?",
			"Allow {name} to extract the analytical story?",
			"Let {name} outline the holistic macro-arc?",
			"What is the final distillation according to {name}?",
		],
		assertive: [
			"{name} is ready to synthesize the state of play",
			"Let {name} unify these scattered positions",
			"{name} isolates the ultimate signal from noise",
			"{name} demands a clean conceptual wrap-up",
			"This complexity requires {name}'s distillation",
			"Let {name} define the current room consensus",
			"{name} binds all loose arguments together",
			"Execute a synthesis turn with {name}",
			"{name} maps exactly where this deliberation lands",
			"Let {name} draw the definitive conclusion",
		],
		reflective: [
			"{name} is preparing a balanced birds-eye view",
			"Prompt a measured synthesis from {name}?",
			"{name} is holding a mirror to the deliberation",
			"Let {name} look back and anchor our progress",
			"Allow {name} to map out the matrix of agreement?",
			"{name} tracks the systemic thread among anomalies",
			"Let {name} outline the conceptual journey so far",
			"Allow {name} to gather the intellectual fragments?",
			"{name} is ready to extract meaning from raw dialogue",
			"Deploy a reflective distillation from {name}",
		],
		playful: [
			"{name} is ready to condense all this chaos",
			"{name} sees right through the noise",
			"Let {name} step up as structural archivist",
			"Bring in {name}'s high-level abstraction?",
			"{name} is about to map our collective matrix",
			"Buckle up, {name} is distilling everything",
			"Let {name} find the core truth we missed",
			"Allow {name} to shift us to the meta-analysis?",
			"Let {name} draw the ultimate perimeter line",
			"Plot twist: let {name} solve the divergence",
		],
		urgent: [
			"{name} must synthesize the state now",
			"Critical state-of-discussion update from {name}",
			"Do not proceed without {name}'s diagnostic summary",
			"{name} detects an urgent need for alignment",
			"Immediate synthesis required to save the thread",
			"{name} demands we solidify before we drift",
			"This impasse requires {name}'s architectural wrap",
			"Urgent: let {name} bind the conflicting vectors",
			"{name} captures the critical arc of crisis",
			"Halt and allow {name} to audit our total progress",
		],
	},

	[INTENT_OPTION.DIRECT]: {
		curious: [
			"Let {name} address the elephant in the room?",
			"Want {name} to establish an unadorned baseline?",
			"See what {name} thinks stripped of overhead?",
			"Allow {name} to lay down a direct premise?",
			"See what {name} states when filters are removed?",
			"Want {name} to slice straight through the jargon?",
			"Allow {name} to articulate unreservedly?",
			"See {name}'s unfiltered direct perspective?",
			"Let's pull out {name}'s pure, uncompromised take?",
			"Want a zero-overhead position from {name}?",
		],
		assertive: [
			"{name} is ready to offer a direct position",
			"Let {name} lay it down unequivocally",
			"{name} has a straight-line contribution",
			"{name} cuts straight to the core metric",
			"Deploy a point-blank perspective from {name}",
			"Let {name} present the hard thesis",
			"{name} articulates with absolute clarity",
			"Hear {name}'s uncompromising contribution",
			"{name} delivers a zero-overhead position",
			"Let {name} execute a direct turn",
		],
		reflective: [
			"{name} is prepared to deliver an earnest truth",
			"Prompt a straightforward, measured stance from {name}?",
			"{name} is isolating the singular objective fact",
			"Let {name} state their unvarnished mind",
			"Allow {name} to map the most direct path forward?",
			"{name} cuts cleanly to the core value layer",
			"Bring in {name}'s transparent analytical honesty?",
			"Let {name} lay down a straightforward foundation",
			"See {name}'s raw, unabstracted insight?",
			"Allow {name} to bypass the conceptual overhead?",
		],
		playful: [
			"{name} is ready to drop all formalities",
			"{name} is going straight to the punchline",
			"Let {name} strip the rhetorical fluff away",
			"Bring in {name}'s clinical, raw interpretation?",
			"{name} is about to get brutally honest",
			"Let {name} bypass the entire intellectual dance",
			"Allow {name} to state the absolute baseline?",
			"{name} is entering with zero rhetorical armor",
			"Switch to direct execution mode with {name}",
			"Let {name} drop the complex framing",
		],
		urgent: [
			"{name} must state their direct position now",
			"Direct and high-priority input from {name}",
			"Critical direct resolution required",
			"{name} demands an immediate reality check",
			"Deploy immediate, explicit feedback from {name}",
			"{name} breaks protocol to intervene directly",
			"Don't pause: {name} has a direct bottleneck to fix",
			"Urgent direct perspective from {name}",
			"{name} commands a blunt, hyper-focused turn",
			"Critical direct response from {name}",
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
 * Selects mood based on context.
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
