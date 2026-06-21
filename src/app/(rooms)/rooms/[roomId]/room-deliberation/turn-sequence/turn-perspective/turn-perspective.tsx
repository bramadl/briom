import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

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
			rehypePlugins={[[rehypeHighlight], [rehypeSanitize, sanitizeSchema]]}
			remarkPlugins={[remarkGfm]}
		>
			{content}
		</ReactMarkdown>
	);
}
