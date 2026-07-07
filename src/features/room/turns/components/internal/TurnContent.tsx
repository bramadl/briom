"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";
import "katex/dist/katex.min.css";

import { MarkdownComponents } from "./MarkdownComponents";

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

interface TurnContentProps {
	content: string;
}

/**
 * @description
 * `memo`-wrapped so React can bail out of the re-parse entirely when
 * `content` hasn't actually changed since the last render — relevant
 * now that the caller (`useSmoothedStreamText`) updates `content`
 * inside a `startTransition`: transitions can be interrupted and
 * re-run with a newer value, and this guards against ever re-running
 * the (expensive) markdown pipeline for a value it already rendered.
 *
 * `content` is a plain string, so the default shallow-prop-equality
 * `memo` behavior is sufficient — no custom comparator needed.
 */
export const TurnContent = memo(function TurnContent({
	content,
}: TurnContentProps) {
	return (
		<ReactMarkdown
			components={MarkdownComponents}
			rehypePlugins={REHYPE_PLUGINS}
			remarkPlugins={REMARK_PLUGINS}
		>
			{content}
		</ReactMarkdown>
	);
});
