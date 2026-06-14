import type { TooltipContent } from "@briom/components/ui/tooltip";
import {
	Copy,
	Edit,
	type LucideProps,
	Reply,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";

type MessageAction = {
	forAi?: boolean;
	forUser?: boolean;
	icon: React.ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
};

export const MESSAGE_ACTIONS: MessageAction[] = [
	{
		forAi: true,
		forUser: true,
		icon: Copy,
		tooltip: "Copy Message",
	},
	{
		forAi: false,
		forUser: true,
		icon: Edit,
		tooltip: "Edit Message",
	},
	{
		forAi: true,
		forUser: false,
		icon: ThumbsUp,
		tooltip: "Like Message",
	},
	{
		forAi: true,
		forUser: false,
		icon: ThumbsDown,
		tooltip: "Dislike Message",
	},
	{
		forAi: true,
		forUser: false,
		icon: Reply,
		tooltip: "Reply Message",
	},
];
