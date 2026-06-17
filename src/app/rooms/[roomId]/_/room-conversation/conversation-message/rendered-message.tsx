import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "./markdown.components";

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

interface RenderedMessageProps {
	content: string;
}

export function RenderedMessage({ content }: RenderedMessageProps) {
	return (
		<ReactMarkdown
			components={markdownComponents}
			rehypePlugins={[
				[rehypeHighlight, { detect: true, ignoreMissing: true }],
				[rehypeSanitize, sanitizeSchema],
			]}
			remarkPlugins={[remarkGfm]}
		>
			{content}
		</ReactMarkdown>
	);
}
