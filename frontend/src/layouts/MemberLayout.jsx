import { LayoutDashboard, Dumbbell, Brain, Salad, Settings } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/',          icon: LayoutDashboard },
  { label: 'Workouts',  to: '/workouts',  icon: Dumbbell        },
  { label: 'Coaching',  to: '/coaching',  icon: Brain           },
  { label: 'Nutrition', to: '/nutrition', icon: Salad           },
  { label: 'Settings',  to: '/settings',  icon: Settings        },
]

export default function MemberLayout() {
  return (
    <CuSidebar navItems={navItems}/>
  )
}
