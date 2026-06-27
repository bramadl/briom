"use client";

import { useRouter } from "@bprogress/next";
import { supabaseClient } from "@briom/supabase/client";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@briom/ui/dropdown-menu";
import {
	BadgeCheckIcon,
	BellIcon,
	CreditCardIcon,
	Loader2Icon,
	LogOutIcon,
	SparklesIcon,
} from "lucide-react";
import { Fragment, useCallback, useState } from "react";

export function MenuOptions() {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = useCallback(async () => {
		setIsSigningOut(true);
		await supabaseClient.auth.signOut();
		router.push("/");
	}, [router]);

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
			<DropdownMenuItem disabled={isSigningOut} onClick={handleSignOut}>
				{isSigningOut ? (
					<Loader2Icon className="animate-spin" />
				) : (
					<LogOutIcon />
				)}
				{isSigningOut ? "Signing out..." : "Log out"}
			</DropdownMenuItem>
		</Fragment>
	);
}
