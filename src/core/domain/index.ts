// =====================================================================
// Moderator Module
// =====================================================================

export * from "./moderator/errors/insufficient-name.error";
export * from "./moderator/errors/invalid-avatar.error";
export * from "./moderator/errors/invalid-email.error";

export * from "./moderator/events/moderator-registered.event";

export * from "./moderator/moderator";
export * from "./moderator/moderator.id";
export * from "./moderator/moderator.policy";
export * from "./moderator/moderator.repository";

// ===== Credit Submodule

export * from "./moderator/credit/credit";
export * from "./moderator/credit/credit.deduction";
export * from "./moderator/credit/credit.usage";

export * from "./moderator/credit/errors/insufficient-credit.error";
export * from "./moderator/credit/errors/invalid-usage.error";
export * from "./moderator/credit/errors/negative-credit.error";

// ===== Credit Movement Submodule

export * from "./moderator/credit/movement/credit-movement";
export * from "./moderator/credit/movement/credit-movement.repository";
export * from "./moderator/credit/movement/credit-movement.type";

export * from "./moderator/credit/movement/errors/empty-movement-reason.error";

// =====================================================================
// Room Module
// =====================================================================

export * from "./room/errors/cannot-conclude-room.error";
export * from "./room/errors/cannot-freeze-room.error";
export * from "./room/errors/cannot-lock-room.error";
export * from "./room/errors/cannot-start-deliberation.error";
export * from "./room/errors/empty-title.error";
export * from "./room/errors/empty-topic.error";
export * from "./room/errors/maximum-attachment-reached.error";
export * from "./room/errors/maximum-participant-reached.error";
export * from "./room/errors/not-accepting-turns.error";
export * from "./room/errors/participant-already-invited.error";
export * from "./room/errors/participate-after-deliberation.error";

export * from "./room/events/base.event";
export * from "./room/events/checkpoint-generated.event";
export * from "./room/events/checkpoint-initiated.event";
export * from "./room/events/deliberation-concluded.event";
export * from "./room/events/deliberation-started.event";
export * from "./room/events/room-formed.event";
export * from "./room/events/room-frozen.event";
export * from "./room/events/room-locked.event";
export * from "./room/events/room-unfrozen.event";
export * from "./room/events/room-unlocked.event";
export * from "./room/events/topic-generated.event";
export * from "./room/events/turn-slot-claimed.event";
export * from "./room/events/turn-slot-released.event";

export * from "./room/room";
export * from "./room/room.id";
export * from "./room/room.repository";
export * from "./room/room.state";
export * from "./room/room.status";

// ===== Checkpoint Submodule

export * from "./room/checkpoint/checkpoint";
export * from "./room/checkpoint/checkpoint.id";
export * from "./room/checkpoint/checkpoint.repository";

export * from "./room/checkpoint/errors/empty-checkpoint.error";

export * from "./room/checkpoint/policies/checkpoint.freeze";
export * from "./room/checkpoint/policies/checkpoint.trigger";
export * from "./room/checkpoint/policies/checkpoint.word-budget";

// ===== Deliberation Submodule

export * from "./room/deliberation/deliberation";
export * from "./room/deliberation/deliberation.sequence-turn";

export * from "./room/deliberation/errors/no-participants-available.error";
export * from "./room/deliberation/errors/participant-not-found.error";

// ===== Participant Submodule

export * from "./room/participant/errors/empty-display-name.error";

export * from "./room/participant/models/participant.model";
export * from "./room/participant/models/participant-model.ai";
export * from "./room/participant/models/participant-model.provider";

export * from "./room/participant/participant";
export * from "./room/participant/participant.id";

// ===== Turn Submodule

export * from "./room/turn/errors/empty-perspective.error";
export * from "./room/turn/errors/invalid-author.error";
export * from "./room/turn/errors/invalid-state-transition.error";
export * from "./room/turn/errors/missing-intent.error";
export * from "./room/turn/errors/negative-sequence.error";
export * from "./room/turn/errors/stream.error";

export * from "./room/turn/events/base.event";
export * from "./room/turn/events/turn-abandoned.event";
export * from "./room/turn/events/turn-failed.event";
export * from "./room/turn/events/turn-initiated.event";
export * from "./room/turn/events/turn-retried.event";
export * from "./room/turn/events/turn-settled.event";
export * from "./room/turn/events/turn-stream-started.event";
export * from "./room/turn/events/turn-token-accumulated.event";

export * from "./room/turn/instructions/instructions";
export * from "./room/turn/instructions/instructions.prompts";

export * from "./room/turn/turn";
export * from "./room/turn/turn.author";
export * from "./room/turn/turn.error";
export * from "./room/turn/turn.id";
export * from "./room/turn/turn.intent";
export * from "./room/turn/turn.repository";
export * from "./room/turn/turn.sequence";
export * from "./room/turn/turn.state";
export * from "./room/turn/turn.token-accumulator";

// ----- Attachment Submodule

export * from "./room/turn/attachment/attachment";
export * from "./room/turn/attachment/attachment.content";
export * from "./room/turn/attachment/attachment.media-type";
export * from "./room/turn/attachment/attachment.policy";

export * from "./room/turn/attachment/errors/attachment-validation.error";

// ----- Proposal Submodule

export * from "./room/turn/proposals/proposal.context";
export * from "./room/turn/proposals/proposal.generator";
export * from "./room/turn/proposals/proposal.result";
export * from "./room/turn/proposals/proposal-dictionary";
export * from "./room/turn/proposals/proposal-eligibility";
