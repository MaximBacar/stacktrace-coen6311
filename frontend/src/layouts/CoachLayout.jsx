import { LayoutDashboard, Inbox, Users, CalendarDays, Dumbbell, Settings } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/dashboard',      icon: LayoutDashboard },
  { label: 'Requests',  to: '/requests',        icon: Inbox           },
  { label: 'Clients',   to: '/clients',         icon: Users           },
  { label: 'Calendar',  to: '/calendar',        icon: CalendarDays    },
  { label: 'Workouts',  to: '/coach/workouts',  icon: Dumbbell        },
  { label: 'Settings',  to: '/settings',        icon: Settings        },
]

export default function CoachLayout() {
  return <CuSidebar navItems={navItems} />
}
