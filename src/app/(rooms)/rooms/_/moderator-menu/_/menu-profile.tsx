import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@briom/components/ui/avatar";

interface MenuProfile extends React.ComponentProps<"div"> {
	avatar?: string;
	email: string;
	name: string;
}

export function MenuProfile({ avatar, email, name, ...props }: MenuProfile) {
	return (
		<div
			className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
			{...props}
		>
			<Avatar className="h-8 w-8 rounded-lg">
				<AvatarImage alt={name} src={avatar} />
				<AvatarFallback className="rounded-lg">CN</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-xs">{email}</span>
			</div>
		</div>
	);
}
