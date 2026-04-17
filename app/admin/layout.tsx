import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { AdminRouteShell } from "@/components/admin/admin-route-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminRouteShell>{children}</AdminRouteShell>
    </AdminAuthProvider>
  );
}
