import { cn } from "@briom/libs/utils";
import type { Components } from "react-markdown";

import { CodeBlockShell } from "./code-block-shell";

function getLanguageFromNode(node: unknown): string {
	if (!node || typeof node !== "object") return "text";

	const hastNode = node as {
		children?: Array<{
			properties?: {
				className?: string[];
			};
		}>;
	};

	const codeNode = hastNode.children?.[0];
	const classNames = codeNode?.properties?.className || [];

	const langMatch = classNames.find((c) => c.startsWith("language-"));
	return langMatch ? langMatch.replace("language-", "") : "text";
}

function isPlainText(lang: string): boolean {
	return lang === "txt" || lang === "text" || lang === "";
}

function isTerminal(lang: string): boolean {
	return lang === "bash" || lang === "sh" || lang === "zsh" || lang === "shell";
}

export const markdownComponents: Components = {
	p: ({ children }) => (
		<p className="mb-2 leading-relaxed wrap-break-words">{children}</p>
	),

	ul: ({ children }) => (
		<ul className="list-disc pl-5 wrap-break-words">{children}</ul>
	),

	ol: ({ children }) => (
		<ol className="list-decimal pl-5 wrap-break-words">{children}</ol>
	),

	li: ({ children }) => (
		<li className="leading-relaxed wrap-break-words">{children}</li>
	),

	blockquote: ({ children }) => (
		<blockquote className="border-l-2 pl-3 italic text-muted-foreground wrap-break-words">
			{children}
		</blockquote>
	),

	pre: ({ node, children }) => {
		const lang = getLanguageFromNode(node);

		if (isPlainText(lang)) {
			return (
				<div className="max-w-full my-3">
					<pre className="border-l-2 border-border/50 pl-4 py-2 text-foreground/80 leading-relaxed whitespace-pre-wrap">
						{children}
					</pre>
				</div>
			);
		}

		return (
			<CodeBlockShell isTerminal={isTerminal(lang)} lang={lang}>
				{children}
			</CodeBlockShell>
		);
	},

	code: ({ className, children, ...props }) => {
		const { inline } = props as { inline?: boolean };
		const lang = (() => {
			const match = /language-(\w+)/.exec(className || "");
			return match?.[1] || "text";
		})();

		if (inline) {
			return (
				<code className="bg-muted px-1 py-0.5 rounded break-all font-mono text-primary">
					{children}
				</code>
			);
		}

		if (isPlainText(lang)) {
			return (
				<code className="font-mono text-foreground/80 text-xs rounded-sm">
					{children}
				</code>
			);
		}

		return (
			<code
				className={cn("hljs block bg-transparent", className)}
				data-language={lang}
			>
				{children}
			</code>
		);
	},

	table: ({ children }) => (
		<div className="max-w-full overflow-x-auto pointer-events-none">
			<table className="w-full border-collapse">{children}</table>
		</div>
	),

	th: ({ children }) => (
		<th className="border border-border/50 px-3 py-2 font-medium text-left bg-muted/50">
			{children}
		</th>
	),

	td: ({ children }) => (
		<td className="border border-border/50 px-3 py-2">{children}</td>
	),

	hr: () => <hr className="my-4 border-border/50" />,
};
