"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";
import "katex/dist/katex.min.css";

import { MarkdownComponents } from "./markdown-components";

const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [...(defaultSchema.attributes?.code || []), "className"],
		span: [...(defaultSchema.attributes?.span || []), "className"],
		div: [...(defaultSchema.attributes?.div || []), "className"],
		pre: [...(defaultSchema.attributes?.pre || []), "className"],
	},
};

const REHYPE_PLUGINS: PluggableList = [
	rehypeHighlight,
	[rehypeSanitize, sanitizeSchema],
	rehypeKatex,
];

const REMARK_PLUGINS: PluggableList = [remarkGfm, remarkMath];

interface TurnPerspectiveProps {
	content: string;
}

export function TurnPerspective({ content }: TurnPerspectiveProps) {
	return (
		<ReactMarkdown
			components={MarkdownComponents}
			rehypePlugins={REHYPE_PLUGINS}
			remarkPlugins={REMARK_PLUGINS}
		>
			{content}
		</ReactMarkdown>
	);
}
