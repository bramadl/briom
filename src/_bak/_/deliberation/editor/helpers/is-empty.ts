import { $getRoot, $isParagraphNode } from "lexical";

export function $isEditorEmpty(): boolean {
	const children = $getRoot().getChildren();
	if (children.length === 0) return true;
	if (children.length > 1) return false;
	const onlyChild = children[0];
	return $isParagraphNode(onlyChild) && onlyChild.getChildrenSize() === 0;
}
