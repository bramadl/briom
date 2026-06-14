export default async function RoomPage({
	params,
}: PageProps<"/rooms/[roomId]">) {
	const { roomId } = await params;

	return <div>Room Page :: {roomId}</div>;
}
