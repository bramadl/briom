import type { ParticipantDTO } from "@briom/app/queries/get-room/query.dto";
import { cn } from "@briom/libs/utils";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { PARTICIPANT_COLORS } from "../../mappings/participant-colors.map";
import { markdownComponents } from "./markdown.components";
import { MessageHeader } from "./message-header";

interface StreamingMessageProps {
  content: string;
  participant?: ParticipantDTO;
  participantIndex: number;
}

export function StreamingMessage({
  content,
  participant,
  participantIndex,
}: StreamingMessageProps) {
  const color = PARTICIPANT_COLORS[participantIndex % PARTICIPANT_COLORS.length];
  const qualifiedModel = `${participant?.provider}/${participant?.model}`;

  return (
    <div className="group space-y-2">
      <div className={cn("relative py-1 pl-4 border-l-2", color.border)}>
        <MessageHeader
          displayName={participant?.displayName ?? "AI"}
          intent={null}
          isUser={false}
          model={qualifiedModel}
          textColor={color.text}
        />
        <div className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
          <ReactMarkdown
            components={markdownComponents}
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
          <span className="inline-block w-1.5 h-3.5 bg-primary/60 animate-pulse ml-0.5 translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}