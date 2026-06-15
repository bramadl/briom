import { Logo } from "@briom/components/logo";

export function RoomConversationLoading() {
	return (
		<div className="absolute z-1 inset-0 flex-1 flex flex-col items-center justify-center gap-4 pointer-events-none">
			<Logo size={44} />
			<div className="flex items-center gap-2 text-muted-foreground/40">
				<span className="inline-flex items-end gap-1 font-mono text-xs uppercase tracking-widest">
					Preparing your room
					<span className="flex gap-0.5 items-end h-1 -translate-y-1">
						{[0, 1, 2].map((i) => (
							<span
								className="size-0.5 rounded-full bg-muted-foreground/50 animate-bounce"
								key={i}
								style={{ animationDelay: `${i * 150}ms` }}
							/>
						))}
					</span>
				</span>
			</div>
		</div>
	);
}
