"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isParagraphNode } from "lexical";
import { useEffect, useState } from "react";

export function useEditorEmpty(): boolean {
	const [editor] = useLexicalComposerContext();
	const [isEmpty, setIsEmpty] = useState(true);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const children = $getRoot().getChildren();
				if (children.length === 0) {
					setIsEmpty(true);
					return;
				}
				if (children.length > 1) {
					setIsEmpty(false);
					return;
				}
				const onlyChild = children[0];
				setIsEmpty(
					$isParagraphNode(onlyChild) && onlyChild.getChildrenSize() === 0,
				);
			});
		});
	}, [editor]);

	return isEmpty;
}
