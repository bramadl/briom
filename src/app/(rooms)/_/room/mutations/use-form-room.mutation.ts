import { unwrapOrThrow } from "@briom/libs/server-action";
import { useMutation } from "@tanstack/react-query";

import { formRoom } from "../actions";

export function useFormRoomMutation() {
	return useMutation({ mutationFn: unwrapOrThrow(formRoom) });
}
