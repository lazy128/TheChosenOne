import { createFileRoute } from "@tanstack/react-router";
import { AdminShowtimePage } from "@/components/admin/AdminShowtimePage";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  return <AdminShowtimePage />;
}
