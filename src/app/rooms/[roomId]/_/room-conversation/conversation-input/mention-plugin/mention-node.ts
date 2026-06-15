import {
	$applyNodeReplacement,
	type EditorConfig,
	type LexicalNode,
	type NodeKey,
	type SerializedTextNode,
	type Spread,
	TextNode,
} from "lexical";

export type MentionKind = "participant" | "intent";

export type SerializedMentionNode = Spread<
	{
		mentionKind: MentionKind;
		mentionKey: string;
		isPrimary: boolean;
	},
	SerializedTextNode
>;

export class MentionNode extends TextNode {
	__mentionKind: MentionKind;
	__mentionKey: string;
	__isPrimary: boolean;

	static getType(): string {
		return "mention";
	}

	static clone(node: MentionNode): MentionNode {
		return new MentionNode(
			node.__mentionKind,
			node.__mentionKey,
			node.__text,
			node.__isPrimary,
			node.__key,
		);
	}

	static importJSON(serializedNode: SerializedMentionNode): MentionNode {
		const node = $createMentionNode(
			serializedNode.mentionKind,
			serializedNode.mentionKey,
			serializedNode.text,
			serializedNode.isPrimary,
		);
		node.setFormat(serializedNode.format);
		node.setDetail(serializedNode.detail);
		node.setMode(serializedNode.mode);
		node.setStyle(serializedNode.style);
		return node;
	}

	constructor(
		mentionKind: MentionKind,
		mentionKey: string,
		text: string,
		isPrimary: boolean = true,
		key?: NodeKey,
	) {
		super(text, key);
		this.__mentionKind = mentionKind;
		this.__mentionKey = mentionKey;
		this.__isPrimary = isPrimary;
	}

	exportJSON(): SerializedMentionNode {
		return {
			...super.exportJSON(),
			mentionKind: this.__mentionKind,
			mentionKey: this.__mentionKey,
			isPrimary: this.__isPrimary,
			type: "mention",
			version: 1,
		};
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const dom = document.createElement("span");
		dom.textContent = this.__text;
		dom.spellcheck = false;

		const isParticipant = this.__mentionKind === "participant";
		const isPrimary = this.__isPrimary;

		if (isParticipant && isPrimary) {
			dom.className =
				"text-xs rounded-md bg-primary/15 px-1 py-0.5 font-medium text-primary select-none inline-flex items-center gap-1";
		} else if (isParticipant && !isPrimary) {
			dom.className =
				"text-xs rounded-md bg-secondary/15 px-1 py-0.5 font-medium text-secondary-foreground/50 select-none inline-flex items-center gap-1";
		} else {
			dom.className =
				"text-xs rounded-md bg-muted px-1 py-0.5 font-mono text-xs uppercase tracking-wide text-muted-foreground select-none inline-flex items-center gap-1";
		}

		return dom;
	}

	updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
		if (
			prevNode.__mentionKind !== this.__mentionKind ||
			prevNode.__isPrimary !== this.__isPrimary
		) {
			return true;
		}
		return super.updateDOM(prevNode, dom, config);
	}

	isTextEntity(): true {
		return true;
	}

	canInsertTextBefore(): boolean {
		return false;
	}

	canInsertTextAfter(): boolean {
		return false;
	}
}

export function $createMentionNode(
	mentionKind: MentionKind,
	mentionKey: string,
	text: string,
	isPrimary: boolean = true,
): MentionNode {
	const node = new MentionNode(mentionKind, mentionKey, text, isPrimary);
	node.setMode("token");
	return $applyNodeReplacement(node);
}

export function $isMentionNode(
	node: LexicalNode | null | undefined,
): node is MentionNode {
	return node instanceof MentionNode;
}
