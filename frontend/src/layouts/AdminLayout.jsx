import {
  LayoutDashboard,
  Wrench,
  ScrollText,
  Users,
  UserCog,
  BarChart2,
  Building2,
  Settings,
} from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/',          icon: LayoutDashboard },
  { label: 'Equipment', to: '/equipment', icon: Wrench          },
  { label: 'Policies',  to: '/policies',  icon: ScrollText      },
  { label: 'Members',   to: '/members',   icon: Users           },
  { label: 'Staff',     to: '/staff',     icon: UserCog         },
  { label: 'Analytics', to: '/analytics', icon: BarChart2       },
  { label: null },
  { label: 'Gym',       to: '/gym',       icon: Building2       },
  { label: 'Settings',  to: '/settings',  icon: Settings        },
]

export default function AdminLayout() {
  return <CuSidebar navItems={navItems} />
}
