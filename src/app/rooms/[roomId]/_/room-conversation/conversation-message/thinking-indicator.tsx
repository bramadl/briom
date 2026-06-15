export function ThinkingIndicator({ name }: { name: string }) {
  return (
    <div className="pl-4 border-l-2 py-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground/50 font-mono">
          {name} is thinking
        </span>
        <div className="flex gap-0.5 items-end h-3">
          {[0, 1, 2].map((i) => (
            <span
              className="size-1 rounded-full bg-muted-foreground/50 animate-bounce"
              key={i}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}