"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
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

interface TurnPerspectiveProps {
	content: string;
}

export function TurnPerspective({ content }: TurnPerspectiveProps) {
	return (
		<ReactMarkdown
			components={MarkdownComponents}
			rehypePlugins={[
				rehypeHighlight,
				[rehypeSanitize, sanitizeSchema],
				rehypeKatex,
			]}
			remarkPlugins={[remarkGfm, remarkMath]}
		>
			{content}
		</ReactMarkdown>
	);
}
