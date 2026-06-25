"use client";

import { useSidebar } from "@briom/components/ui/sidebar";
import { useEffect } from "react";

export function AutoOpenSidebar() {
	const { open, setOpen } = useSidebar();

	useEffect(() => {
		if (!open) setOpen(true);
	}, [open, setOpen]);

	return null;
}
