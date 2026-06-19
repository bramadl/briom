import { Button } from "@briom/components/ui/button";
import { Separator } from "@briom/components/ui/separator";
import { remove } from "@formisch/react";

import type { RoomFormSchema } from "./schema";

interface ParticipantRemoverProps extends RoomFormSchema {
	index: number;
}

export function ParticipantRemover({ form, index }: ParticipantRemoverProps) {
	const removeHandler = () => {
		remove(form, { at: index, path: ["participants"] });
	};

	return (
		<div className="flex items-center gap-4">
			<Separator className="flex-1" orientation="horizontal" />
			<Button
				onClick={removeHandler}
				size="xs"
				type="button"
				variant="destructive"
			>
				Uninvite
			</Button>
		</div>
	);
}
