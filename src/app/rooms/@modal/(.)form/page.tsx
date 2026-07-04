import { RoomFormModal } from "@briom/app/_/room";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isMobileUA(ua: string): boolean {
	return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

export default async function RoomsModalFormPage() {
	const headersList = await headers();
	const ua = headersList.get("user-agent") ?? "";
	const isMobileHint = headersList.get("sec-ch-ua-mobile") === "?1";

	if (isMobileUA(ua) || isMobileHint) redirect("/rooms/form");
	return <RoomFormModal />;
}
