import { cn } from "@briom/libs/utils";
import {
	$applyNodeReplacement,
	type EditorConfig,
	type LexicalNode,
	type LexicalUpdateJSON,
	type SerializedTextNode,
	type Spread,
	TextNode,
} from "lexical";

export const mentionBaseClass = cn(
	"mention inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md",
	"font-medium text-xs select-none cursor-default",
);

// Split as arrays so classList.add/remove can spread them without
// string-splitting at runtime.
const PRIMARY_CLASSES = ["bg-primary/15", "text-primary"] as const;
const SECONDARY_CLASSES = [
	"bg-secondary/50",
	"text-secondary-foreground/50",
] as const;

export type SerializedMentionNode = Spread<
	{
		mentionId: string;
		mentionLabel: string;
		isPrimary: boolean;
	},
	SerializedTextNode
>;

/**
 * `isPrimary` is stored on the node and applied in `createDOM`/`updateDOM`
 * so role styling flows through Lexical's own reconciler — no external DOM
 * mutations that could trigger the MutationObserver → infinite update loop.
 *
 * `MentionRolePlugin` keeps this value up to date via `registerNodeTransform`,
 * which runs inside the update cycle and is loop-safe by design.
 */
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
			node.__text,
			node.__key,
		);
	}

	constructor(
		mentionId: string,
		mentionLabel: string,
		isPrimary = false,
		text?: string,
		key?: string,
	) {
		super(text ?? `@${mentionLabel}`, key);
		this.__mentionId = mentionId;
		this.__mentionLabel = mentionLabel;
		this.__isPrimary = isPrimary;
		this.setMode("token");
	}

	static importJSON(serializedNode: SerializedMentionNode): MentionNode {
		return $createMentionNode(
			serializedNode.mentionId,
			serializedNode.mentionLabel,
			serializedNode.isPrimary,
		).updateFromJSON(serializedNode);
	}

	updateFromJSON(
		serializedNode: LexicalUpdateJSON<SerializedMentionNode>,
	): this {
		return super
			.updateFromJSON(serializedNode)
			.setMentionId(serializedNode.mentionId)
			.setMentionLabel(serializedNode.mentionLabel)
			.setIsPrimary(serializedNode.isPrimary);
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
		dom.className = mentionBaseClass;
		dom.dataset.mentionId = this.__mentionId;
		this._applyRoleClasses(dom, this.__isPrimary);
		return dom;
	}

	updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
		const shouldRecreate = super.updateDOM(prevNode, dom, config);
		if (prevNode.__isPrimary !== this.__isPrimary) {
			this._applyRoleClasses(dom, this.__isPrimary);
		}
		return shouldRecreate;
	}

	private _applyRoleClasses(dom: HTMLElement, isPrimary: boolean): void {
		if (isPrimary) {
			dom.classList.add(...PRIMARY_CLASSES);
			dom.classList.remove(...SECONDARY_CLASSES);
		} else {
			dom.classList.remove(...PRIMARY_CLASSES);
			dom.classList.add(...SECONDARY_CLASSES);
		}
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
