import { cn } from "@briom/utils";

type ContainerProps<T extends React.ElementType = "div"> = {
	as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

export function Container<T extends React.ElementType = "div">({
	as,
	className,
	children,
	...props
}: ContainerProps<T>) {
	const Component = as || "div";
	return (
		<Component className={cn("container px-6 mx-auto", className)} {...props}>
			{children}
		</Component>
	);
}
