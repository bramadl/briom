export type JSONNode = {
	type?: string;
	text?: string;
	content?: JSONNode[];
	attrs?: Record<string, unknown>;
	marks?: { type: string; attrs?: Record<string, unknown> }[];
};
