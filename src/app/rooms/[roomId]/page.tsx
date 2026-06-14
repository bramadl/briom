export default async function RoomPage({
	params,
}: PageProps<"/rooms/[roomId]">) {
	const { roomId } = await params;

	return (
		<div className="flex flex-col gap-4">
			Room Page :: {roomId}
			<div className="flex flex-col gap-4">
				{Array.from({ length: 24 }).map((_, index) => (
					<div
						className="aspect-video h-12 w-full rounded-lg bg-muted/50"
						key={index.toString()}
					/>
				))}
			</div>
		</div>
	);
}
