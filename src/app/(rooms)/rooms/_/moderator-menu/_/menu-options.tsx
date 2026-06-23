import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@briom/ui/dropdown-menu";
import {
	BadgeCheckIcon,
	BellIcon,
	CreditCardIcon,
	LogOutIcon,
	SparklesIcon,
} from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export function MenuOptions() {
	return (
		<Fragment>
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<SparklesIcon />
					Upgrade to Pro
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
					Billing
				</DropdownMenuItem>
				<DropdownMenuItem>
					<BellIcon />
					Notifications
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem>
				<LogOutIcon />
				Log out
			</DropdownMenuItem>
		</Fragment>
	);
}
