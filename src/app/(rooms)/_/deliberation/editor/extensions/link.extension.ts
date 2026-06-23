import { LinkNode } from "@lexical/link";
import { defineExtension } from "lexical";

export const LinkExtension = defineExtension({
	name: "@briom/lexical/Link",
	nodes: () => [LinkNode],
});
