"use client";

import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@briom/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@briom/components/ui/tooltip";
import { cn } from "@briom/libs/utils";
import {
  Copy,
  Edit,
  Reply,
  Check,
} from "lucide-react";

interface MessageActionsProps {
  isUser?: boolean;
  time: string;
  content: string;
}

export function MessageActions({ time, isUser, content }: MessageActionsProps) {
  const [_, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);


  const inlineActions = [
    {
      id: "copy",
      forAi: true,
      forUser: true,
      icon: isCopied ? Check : Copy,
      tooltip: isCopied ? "Copied!" : "Copy Message",
      onClick: async () => {
        const success = await copy(content);
        if (success) {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      },
    },
    {
      id: "edit",
      forAi: false,
      forUser: true,
      icon: Edit,
      tooltip: "Edit Message",
      onClick: () => console.log("Edit clicked"),
    },
    {
      id: "reply",
      forAi: true,
      forUser: false,
      icon: Reply,
      tooltip: "Reply Message",
      onClick: () => console.log("Reply clicked"),
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-1 text-[11px] text-muted-foreground/50 font-mono tabular-nums lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        !isUser && "flex-row-reverse",
      )}
    >
      {time}
      <span className="flex-1">
        <span className="block bg-border h-px md:w-0 group-hover:w-full transition-[width] duration-500" />
      </span>
      <div className="flex items-center">
        {inlineActions.map((action, i) => {
          if (action.forUser && !action.forAi && !isUser) return null;
          if (action.forAi && !action.forUser && isUser) return null;

          const IconComponent = action.icon;
          return (
            <Tooltip disableHoverableContent key={i.toString()}>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={action.onClick}
                >
                  <IconComponent className={cn(action.id === "copy" && isCopied && "text-green-500")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="center" side="top">
                {action.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}