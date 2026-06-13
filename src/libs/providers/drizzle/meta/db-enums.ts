import { enumsSchema } from "./db-schema";

export const authorTypeEnum = enumsSchema.enum("author_type", [
	"user",
	"participant",
]);

export const intentEnum = enumsSchema.enum("intent", [
	"respond",
	"critique",
	"summarize",
	"challenge",
	"expand",
]);
