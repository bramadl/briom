import { useQueryClient } from "@tanstack/react-query";
import { moderatorQueryKeys } from "../keys";

export function useModeratorUsageInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: moderatorQueryKeys.usage() });
	};

	return { invalidate };
}
