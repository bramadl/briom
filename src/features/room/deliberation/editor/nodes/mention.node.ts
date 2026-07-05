import {
	$applyNodeReplacement,
	type EditorConfig,
	type LexicalNode,
	type SerializedTextNode,
	type Spread,
	TextNode,
} from "lexical";

export type SerializedMentionNode = Spread<
	{
		mentionId: string;
		mentionLabel: string;
		isPrimary: boolean;
	},
	SerializedTextNode
>;

const PRIMARY_CLASSES = ["bg-primary/15", "text-primary"] as const;
const SECONDARY_CLASSES = [
	"bg-secondary/50",
	"text-secondary-foreground/50",
] as const;

export class MentionNode extends TextNode {
	__mentionId: string;
	__mentionLabel: string;
	__isPrimary: boolean;

	static getType(): string {
		return "mention";
	}

	static clone(node: MentionNode): MentionNode {
		return new MentionNode(
			node.__mentionId,
			node.__mentionLabel,
			node.__isPrimary,
			node.__key,
		);
	}

	constructor(
		mentionId: string,
		mentionLabel: string,
		isPrimary = false,
		key?: string,
	) {
		super(`@${mentionLabel}`, key);
		this.__mentionId = mentionId;
		this.__mentionLabel = mentionLabel;
		this.__isPrimary = isPrimary;
		this.__mode = 1;
	}

	static importJSON(serializedNode: SerializedMentionNode): MentionNode {
		const node = new MentionNode(
			serializedNode.mentionId,
			serializedNode.mentionLabel,
			serializedNode.isPrimary,
		);
		node.__format = serializedNode.format;
		node.__style = serializedNode.style;
		node.__mode = serializedNode.mode as unknown as 0 | 1 | 2 | 3;
		node.__detail = serializedNode.detail;
		return node;
	}

	exportJSON(): SerializedMentionNode {
		return {
			...super.exportJSON(),
			isPrimary: this.__isPrimary,
			mentionId: this.__mentionId,
			mentionLabel: this.__mentionLabel,
			type: "mention",
			version: 1,
		};
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);
		dom.className = [
			"mention inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md",
			"font-medium text-xs select-none cursor-default",
			...(this.__isPrimary ? PRIMARY_CLASSES : SECONDARY_CLASSES),
		].join(" ");
		dom.dataset.mentionId = this.__mentionId;
		return dom;
	}

	updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
		const shouldRecreate = super.updateDOM(prevNode, dom, config);
		if (prevNode.__isPrimary !== this.__isPrimary) {
			const add = this.__isPrimary ? PRIMARY_CLASSES : SECONDARY_CLASSES;
			const remove = this.__isPrimary ? SECONDARY_CLASSES : PRIMARY_CLASSES;
			dom.classList.remove(...remove);
			dom.classList.add(...add);
		}
		return shouldRecreate;
	}

	getMentionId(): string {
		return this.getLatest().__mentionId;
	}

	setMentionId(mentionId: string): this {
		const self = this.getWritable();
		self.__mentionId = mentionId;
		return self;
	}

	getMentionLabel(): string {
		return this.getLatest().__mentionLabel;
	}

	setMentionLabel(mentionLabel: string): this {
		const self = this.getWritable();
		self.__mentionLabel = mentionLabel;
		return self;
	}

	getIsPrimary(): boolean {
		return this.getLatest().__isPrimary;
	}

	setIsPrimary(isPrimary: boolean): this {
		const self = this.getWritable();
		self.__isPrimary = isPrimary;
		return self;
	}

	canInsertTextBefore(): boolean {
		return false;
	}

	canInsertTextAfter(): boolean {
		return false;
	}

	isTextEntity(): true {
		return true;
	}
}

export function $createMentionNode(
	mentionId: string,
	mentionLabel: string,
	isPrimary = false,
): MentionNode {
	return $applyNodeReplacement(
		new MentionNode(mentionId, mentionLabel, isPrimary),
	);
}

export function $isMentionNode(
	node: LexicalNode | null | undefined,
): node is MentionNode {
	return node instanceof MentionNode;
}
