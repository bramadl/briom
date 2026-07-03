import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { FormRoomModal } from "./_/form-room-modal";

function isMobileUA(ua: string): boolean {
	return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

export default async function FormRoomModalPage() {
	const headersList = await headers();
	const ua = headersList.get("user-agent") ?? "";
	const isMobileHint = headersList.get("sec-ch-ua-mobile") === "?1";

	if (isMobileUA(ua) || isMobileHint) {
		redirect("/rooms/form");
	}

	return <FormRoomModal />;
}
