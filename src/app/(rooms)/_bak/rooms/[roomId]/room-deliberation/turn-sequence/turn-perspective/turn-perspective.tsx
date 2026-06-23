"use client";

// import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { MarkdownComponents } from "./markdown-components";

// const ReactMarkdown = dynamic(() => import("react-markdown"), {
// 	ssr: false,
// 	loading() {
// 		return (
// 			<div className="space-y-2">
// 				<div className="h-3 rounded shimmer-bar w-[85%]" />
// 				<div className="h-3 rounded shimmer-bar w-48" />
// 				<div className="h-3 rounded shimmer-bar w-32" />
// 				<div className="h-3 rounded shimmer-bar w-[40%]" />
// 			</div>
// 		);
// 	},
// });

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
