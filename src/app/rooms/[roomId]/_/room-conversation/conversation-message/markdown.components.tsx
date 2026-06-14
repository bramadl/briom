import type { Components } from "react-markdown";

export const markdownComponents: Components = {
	p: ({ children }: React.PropsWithChildren) => (
		<p className="mb-2 leading-relaxed text-sm">{children}</p>
	),

	ul: ({ children }: React.PropsWithChildren) => (
		<ul className="list-disc pl-5 space-y-1">{children}</ul>
	),

	ol: ({ children }: React.PropsWithChildren) => (
		<ol className="list-decimal pl-5 space-y-1">{children}</ol>
	),

	li: ({ children }: React.PropsWithChildren) => (
		<li className="text-sm leading-relaxed">{children}</li>
	),

	blockquote: ({ children }: React.PropsWithChildren) => (
		<blockquote className="border-l-2 pl-3 italic text-muted-foreground">
			{children}
		</blockquote>
	),

	code: ({ children }: React.PropsWithChildren) => (
		<code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
	),
};
