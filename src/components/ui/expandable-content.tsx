"use client";

import { cn } from "@briom/libs/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DEFAULT_COLLAPSED_HEIGHT = 64;
const FADE_START_PERCENT = 1;

interface ExpandableContentProps {
  children: React.ReactNode;
  className?: string;
  collapsedHeight?: number;
  defaultCollapsed?: boolean;
}

export function ExpandableContent({
  children,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  defaultCollapsed = true,
  className,
}: ExpandableContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const [fullHeight, setFullHeight] = useState<number | null>(null);

  const measure = () => {
    if (!ref.current) return;
    setFullHeight(ref.current.scrollHeight);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run before paint so ot never flashes unclamped content.
  useLayoutEffect(() => {
    measure();
  }, [children]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Re-measure if the container resizes.
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const overflowing = fullHeight !== null && fullHeight > collapsedHeight + 1;
  const showFade = overflowing && !expanded;

  const maxHeight = expanded
    ? (fullHeight ?? undefined)
    : (overflowing || fullHeight === null) && defaultCollapsed
      ? collapsedHeight
      : undefined;

  const maskImage = showFade
    ? `linear-gradient(to bottom, black ${FADE_START_PERCENT}%, transparent 100%)`
    : undefined;

  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-clip transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none",
          className,
        )}
        ref={ref}
        style={{
          maxHeight, maskImage, WebkitMaskImage: maskImage,
        }}
      >
        {children}
      </div>

      {(overflowing || (fullHeight === null && defaultCollapsed)) && (
        <button
          className="mt-1.5 flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          {expanded ? "Show less" : "Show more"}
          {expanded ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>
      )}
    </div>
  );
}
