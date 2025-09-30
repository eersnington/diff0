import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await preloadQuery(api.auth.getCurrentUser);

  return (
    <SidebarProvider>
      <AppSidebar preloadedUser={currentUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
