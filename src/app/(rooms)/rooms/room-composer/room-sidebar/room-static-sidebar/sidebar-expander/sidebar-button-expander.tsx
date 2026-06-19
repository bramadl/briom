import { Button } from "@briom/components/ui/button";
import { SidebarTrigger } from "@briom/components/ui/sidebar";

export function SidebarButtonExpander() {
	return (
		<Button
			asChild
			className="absolute left-4 top-4 md:hidden"
			variant="outline"
		>
			<SidebarTrigger />
		</Button>
	);
}
