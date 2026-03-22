import { Sidebar,SidebarContent,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarInset,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarProvider,SidebarTrigger } from '@/components/ui/sidebar'
import { NavUser } from '@/components/NavUser'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

export const CuSidebar = ({ navItems }) => {
  return (
    <SidebarProvider className="h-full min-h-0">
      <Sidebar variant="inset" collapsible="icon" className="">
        <SidebarHeader>
          <NavUser />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild tooltip={label}>
                      <NavLink
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => cn(
                          isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

      </Sidebar>

      <SidebarInset className="w-full min-h-0 flex flex-col overflow-y-hidden">
        <header className="flex h-12 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex flex-col w-full h-full min-h-0 py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
