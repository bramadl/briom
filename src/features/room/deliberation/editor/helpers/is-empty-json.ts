export function isEmptyEditorJSON(json: unknown): boolean {
	if (!json || typeof json !== "object") return true;

	const root = (json as Record<string, unknown>).root;
	if (!root || typeof root !== "object") return true;

	const children = (root as Record<string, unknown>).children as
		| unknown[]
		| undefined;

	if (!children || children.length === 0) return true;
	if (children.length === 1) {
		const first = children[0] as Record<string, unknown>;
		if (
			first.type === "paragraph" &&
			(!first.children || (first.children as unknown[]).length === 0)
		) {
			return true;
		}
	}

	return false;
}
