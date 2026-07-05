interface RoomParticipantGridProps<TModel> {
	/**
	 * @description
	 * Render function accepting the model as `item` props. The returned
	 * node must carry its own `key` (React can't infer it through this
	 * indirection).
	 */
	children: (item: TModel) => React.ReactNode;

	/**
	 * @description
	 * True while the model list itself is being fetched (not to be
	 * confused with `isFiltering`/`isPending` on individual items, which
	 * is about local search debouncing, not network state).
	 */
	isLoading?: boolean;

	/**
	 * @description
	 * The list of models (typically fetched from external
	 * provider, e.g.: OpenRouter), already filtered.
	 */
	models: TModel[];
}

function GridSkeleton() {
	return (
		<div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start gap-4 px-4 py-6">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					className="h-[88px] rounded-lg border bg-muted/30 animate-pulse"
					key={i.toString()}
				/>
			))}
		</div>
	);
}

export function RoomParticipantGrid<TModel>({
	children,
	isLoading = false,
	models,
}: RoomParticipantGridProps<TModel>) {
	if (isLoading) return <GridSkeleton />;
	return (
		<div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start gap-4 px-4 py-6 overflow-y-auto">
			{models.length > 0 ? (
				models.map((model) => children(model))
			) : (
				<div className="col-span-4 text-center py-4 lg:py-8 text-sm text-muted-foreground">
					No AI models match your criteria.
				</div>
			)}
		</div>
	);
}
