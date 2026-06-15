import { SidebarInset, SidebarProvider } from "@briom/components/ui/sidebar";
import { briom } from "@briom/container";

import { RoomList } from "./_/room-list";
import { RoomSidebar } from "./_/room-sidebar";

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await briom.getRooms({} as never);
  if (result.isError()) return <pre>{JSON.stringify(result.error(), null, 2)}</pre>
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "350px" } as React.CSSProperties}
    >
      <RoomSidebar>
        <RoomList rooms={result.value().rooms} />
      </RoomSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
