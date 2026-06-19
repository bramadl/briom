import { cn } from "@briom/libs/utils";
import { cva, type VariantProps } from "class-variance-authority";

const thinkingVariants = cva(
	"rounded-full animate-bounce transition-colors duration-700",
	{
		variants: {
			variant: {
				foreground: "bg-foreground",
				background: "bg-primary-foreground",
			},
			size: {
				xs: "size-0.5",
				sm: "size-1",
				default: "size-1.5",
				md: "size-2",
				lg: "size-2.5",
				xl: "size-3",
			},
		},
		defaultVariants: {
			size: "xs",
			variant: "foreground",
		},
	},
);

interface AnimatedThinkingProps extends VariantProps<typeof thinkingVariants> {
	text?: string;
}

export function AnimatedThinking({
	text,
	variant = "foreground",
	size = "default",
}: AnimatedThinkingProps) {
	return (
		<span className="inline-flex items-center gap-px">
			{text}
			{[0, 1, 2].map((i) => (
				<span
					className={cn(thinkingVariants({ size, variant }))}
					key={i.toString()}
					style={{ animationDelay: `${i * 320}ms` }}
				/>
			))}
		</span>
	);
}
