import { cn } from "@briom/libs/utils";
import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 leading-relaxed text-sm wrap-break-words">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 wrap-break-words">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 wrap-break-words">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="text-sm leading-relaxed wrap-break-words">
      {children}
    </li>
  ),

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-3 italic text-muted-foreground wrap-break-words">
      {children}
    </blockquote>
  ),

  pre: ({ children }) => (
    <div className="max-w-full overflow-x-auto">
      <pre className="bg-muted p-3 rounded-md text-xs w-full">
        {children}
      </pre>
    </div>
  ),

  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-");

    return isBlock ? (
      <code className={cn(className, "wrap-break-words whitespace-pre-wrap font-mono")}>
        {children}
      </code>
    ) : (
      <span className="bg-muted px-1 py-0.5 rounded text-xs break-all font-mono text-primary">
        {children}
      </span>
    );
  },

  table: ({ children }) => (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  ),
};