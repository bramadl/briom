import { ListItemNode, ListNode } from "@lexical/list";
import { defineExtension } from "lexical";

export const ListExtension = defineExtension({
	name: "@briom/lexical/List",
	nodes: () => [ListNode, ListItemNode],
});
