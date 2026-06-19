import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@briom/components/ui/avatar";
import { ChevronsUpDownIcon } from "lucide-react";

interface SidebarUserSettingsTriggerProps
	extends React.ComponentProps<"button"> {
	avatar?: string;
	email: string;
	name: string;
}

export function SidebarUserSettingsTrigger({
	avatar,
	email,
	name,
	...props
}: SidebarUserSettingsTriggerProps) {
	return (
		<button type="button" {...props}>
			<Avatar className="size-6 ml-1">
				<AvatarImage alt={name} src={avatar} />
				<AvatarFallback className="text-xs">CN</AvatarFallback>
			</Avatar>
			<span className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-xs">{email}</span>
			</span>
			<ChevronsUpDownIcon className="ml-auto size-4" />
		</button>
	);
}
