import { HorizontalRuleNode } from "@lexical/extension";
import { defineExtension } from "lexical";

export const HorizontalRuleExtension = defineExtension({
	name: "@briom/lexical/HorizontalRule",
	nodes: () => [HorizontalRuleNode],
});
