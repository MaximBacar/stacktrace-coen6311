import { Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarInset,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarProvider,SidebarTrigger, SidebarSeparator} from '@/components/ui/sidebar'
import { NavUser } from '@/components/NavUser'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

export const CuSidebar = ({ navItems }) => {
  return (
    <SidebarProvider className="w-full h-full min-h-0">
      <Sidebar variant="inset" collapsible="icon" className="">

        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#912338] text-sidebar-primary-foreground shrink-0">
              <img src="favicons/safari-pinned-tab.svg" alt="CUFitness" className="size-4 brightness-0 invert" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold truncate">CUFitness</span>
              <span className="text-xs text-muted-foreground truncate">Concordia University</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ label, to, icon: Icon }, i) => (
                  label === null
                    ? <SidebarSeparator key={`sep-${i}`} className="mx-0 my-2" />
                    : <SidebarMenuItem key={to}>
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

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>

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
