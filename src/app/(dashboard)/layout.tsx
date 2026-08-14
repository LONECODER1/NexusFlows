import { AppSidebar } from "@/components/app-sidebar";
import { SidebarPrefetch } from "@/components/sidebar-prefetch";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth-utils";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireAuth();

    return (
        <SidebarProvider>
            <SidebarPrefetch />
            <AppSidebar />
            <SidebarInset className="bg-gradient-to-br from-background via-background to-muted/30">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;