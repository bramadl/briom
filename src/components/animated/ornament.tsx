import { cn } from "@briom/libs/utils";

export function AnimatedOrnament({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"fixed w-full h-full top-0 inset-x-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,162,75,0.06),transparent_60%),repeating-radial-gradient(circle_at_0_0,rgba(255,255,255,0.012)_0,rgba(255,255,255,0.012)_1px,transparent_1px,transparent_3px)] pointer-events-none",
				className,
			)}
			{...props}
		/>
	);
}
