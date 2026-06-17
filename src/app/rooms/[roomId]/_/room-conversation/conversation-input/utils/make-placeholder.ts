const SINGLE_PLACEHOLDER_POOLS = [
	"What complex dilemma are we untangling today?",
	"Bring an ambiguous idea into the room...",
	"What assumption should we challenge next?",
	"Introduce a problem, strategy, or open-ended thought...",
	"What's on your mind? Let's look at it from multiple angles.",
	"Lay down a perspective, or ask a model to critique...",
	"What decision or trade-off are you weighing right now?",
	"Start a new line of thought here...",
	"Share a raw concept and let the minds refine it...",
	"What are we exploring today?",
];

const ROOM_PLACEHOLDER_POOLS = [
	"Bring something into the discussion",
	"Orchestrate the perspective evolution here",
	"Guide the room, prompt a model, or challenge a thought",
	"Introduce a topic to the panel",
	"Direct the dialogue or steer the reasoning",
	"Ignite the debate with a new dilemma",
	"Spark an interaction between the models",
	"Throw an idea into the shared context",
	"Moderate the next line of thought",
	"Let the collaborative reasoning begin",
];

export const makePlaceholder = (participantsCount: number) => {
	if (participantsCount > 1) {
		const randomRoomText =
			ROOM_PLACEHOLDER_POOLS[
				Math.floor(Math.random() * ROOM_PLACEHOLDER_POOLS.length)
			];
		return `${randomRoomText}... (use @ to mention a participant)`;
	}

	return SINGLE_PLACEHOLDER_POOLS[
		Math.floor(Math.random() * SINGLE_PLACEHOLDER_POOLS.length)
	];
};
