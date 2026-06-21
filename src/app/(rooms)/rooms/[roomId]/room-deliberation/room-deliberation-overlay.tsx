import { Logo } from "@briom/components/logo";

export function RoomDeliberationOverlay() {
	return (
		<div className="absolute z-50 size-full inset-0 flex items-center justify-center">
			<Logo size={64} tagline />
		</div>
	);
}
