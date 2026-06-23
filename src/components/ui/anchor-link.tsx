import Link from "next/link";

interface AnchorLinkProps {
	href: string;
	label?: string;
}

export function AnchorLink({ href, label }: AnchorLinkProps) {
	return (
		<Link
			aria-label={label ?? "Open to follow link"}
			className="absolute inset-0"
			href={href}
		/>
	);
}
