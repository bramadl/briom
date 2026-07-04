"use client";

import { useLogout } from "@briom/auth/hooks/use-logout";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@briom/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@briom/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@briom/components/ui/sidebar";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { useModerator } from "@briom/moderator/hooks/use-moderator";
import {
	BadgeCheckIcon,
	BellIcon,
	ChevronsUpDownIcon,
	CreditCardIcon,
	SparklesIcon,
} from "lucide-react";

function ModeratorAvatar({ ...props }) {
	const { avatar, initials, name } = useModerator();
	return (
		<Avatar {...props}>
			<AvatarImage alt={name} src={avatar} />
			<AvatarFallback className="text-xs">{initials}</AvatarFallback>
		</Avatar>
	);
}

function ModeratorInfo() {
	const { name, email } = useModerator();
	return (
		<span className="grid flex-1 text-left text-sm leading-tight">
			<span className="truncate font-medium">{name}</span>
			<span className="truncate text-xs">{email}</span>
		</span>
	);
}

function LogoutMenu() {
	const [transitioning, logout] = useLogout();
	return (
		<DropdownMenuItem disabled={transitioning} onClick={logout}>
			Log out
		</DropdownMenuItem>
	);
}

export function SidebarModeratorMenu() {
	const isMobile = useIsMobile();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					asChild
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:p-0 md:h-8"
					size="lg"
				>
					<button type="button">
						<ModeratorAvatar className="size-6 ml-1" />
						<ModeratorInfo />
						<ChevronsUpDownIcon className="ml-auto size-4" />
					</button>
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				side={isMobile ? "bottom" : "right"}
				sideOffset={10}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<ModeratorAvatar className="h-8 w-8 rounded-lg" />
						<ModeratorInfo />
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<SparklesIcon />
						Top up Briom Credit
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheckIcon />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCardIcon />
						Credit
					</DropdownMenuItem>
					<DropdownMenuItem>
						<BellIcon />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<LogoutMenu />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
