import { LayoutDashboard, Inbox, Users, CalendarDays, Dumbbell, UtensilsCrossed, Settings } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/',           icon: LayoutDashboard  },
  { label: 'Requests',  to: '/requests',   icon: Inbox            },
  { label: 'Clients',   to: '/clients',    icon: Users            },
  { label: 'Calendar',  to: '/calendar',   icon: CalendarDays     },
  { label: 'Workouts',  to: '/workouts',   icon: Dumbbell         },
  { label: 'Nutrition', to: '/nutrition',  icon: UtensilsCrossed  },
  { label: 'Settings',  to: '/settings',   icon: Settings         },
]

export default function CoachLayout() {
  return <CuSidebar navItems={navItems} />
}
