import Link from "next/link";

interface AnchorLinkProps extends React.ComponentProps<"a"> {
	href: string;
	label?: string;
}

export function AnchorLink({ href, label, ...props }: AnchorLinkProps) {
	return (
		<Link
			aria-label={label ?? "Open to follow link"}
			className="absolute inset-0"
			href={href}
			{...props}
		/>
	);
}
