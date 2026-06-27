import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@briom/components/ui/avatar";

interface MenuProfile extends React.ComponentProps<"div"> {
	avatar?: string | null;
	email: string;
	name: string;
}

export function MenuProfile({ avatar, email, name, ...props }: MenuProfile) {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((w) => w.charAt(0).toUpperCase())
		.join("");

	return (
		<div
			className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
			{...props}
		>
			<Avatar className="h-8 w-8 rounded-lg">
				<AvatarImage alt={name} src={avatar ?? undefined} />
				<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-xs">{email}</span>
			</div>
		</div>
	);
}
