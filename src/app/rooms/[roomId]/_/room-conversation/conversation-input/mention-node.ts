import {
  $applyNodeReplacement,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";

/**
 * Two kinds of mentions Briom supports in the conversation input:
 * - "participant": @ a participant invited to the room (e.g. "@Claude")
 * - "intent": @ one of the fixed intent presets (e.g. "@critique", "@direct")
 */
export type MentionKind = "participant" | "intent";

export type SerializedMentionNode = Spread<
  {
    mentionKind: MentionKind;
    /**
     * For "participant": the participant's id.
     * For "intent": the intent enum value (e.g. "critique").
     */
    mentionKey: string;
  },
  SerializedTextNode
>;

/**
 * An atomic, non-editable-inline "chip" representing either a participant
 * or an intent preset. Behaves like a single token — selection/deletion
 * treats it as one unit, you can't type inside it.
 */
export class MentionNode extends TextNode {
  __mentionKind: MentionKind;
  __mentionKey: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mentionKind,
      node.__mentionKey,
      node.__text,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionKind,
      serializedNode.mentionKey,
      serializedNode.text,
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
    key?: NodeKey,
  ) {
    super(text, key);
    this.__mentionKind = mentionKind;
    this.__mentionKey = mentionKey;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionKind: this.__mentionKind,
      mentionKey: this.__mentionKey,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.spellcheck = false;
    dom.className =
      this.__mentionKind === "participant"
        ? "rounded-md bg-primary/15 px-1 font-medium text-primary"
        : "rounded-md bg-muted px-1 font-mono text-[0.85em] uppercase tracking-wide text-muted-foreground";
    return dom;
  }

  // Treat as a single entity for selection/deletion purposes — can't
  // place a cursor inside "@Claude" and start editing it character by character.
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
): MentionNode {
  const node = new MentionNode(mentionKind, mentionKey, text);
  node.setMode("token");
  return $applyNodeReplacement(node);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}