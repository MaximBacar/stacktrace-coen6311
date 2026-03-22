import { LayoutDashboard, Inbox, Users, CalendarDays, Settings } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Requests',  to: '/requests',  icon: Inbox           },
  { label: 'Clients',   to: '/clients',   icon: Users           },
  { label: 'Calendar',  to: '/calendar',  icon: CalendarDays    },
  { label: 'Settings',  to: '/settings',  icon: Settings        },
]

export default function CoachLayout() {
  return <CuSidebar navItems={navItems} />
}
