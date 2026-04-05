import { LayoutDashboard, Dumbbell, Brain, Salad, Settings, Sparkles, UserRound, ScrollText, Wrench } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/',          icon: LayoutDashboard },
  { label: 'Workouts',  to: '/workouts',  icon: Dumbbell        },
  { label: 'Coaching',  to: '/coaching',  icon: Brain           },
  { label: 'Nutrition', to: '/nutrition', icon: Salad           },
  { label: 'Fitness Profile', to: '/profile', icon: UserRound },
  { label: null,        to: null,         icon: null            },
  { label: 'Equipment', to: '/equipment-availability', icon: Wrench },
  { label: 'Policies',  to: '/policies',  icon: ScrollText      },
  { label: 'FAQ',       to: '/faq',       icon: Sparkles        },
  { label: 'Settings',  to: '/settings',  icon: Settings        },
]

export default function MemberLayout() {
  return (
    <CuSidebar navItems={navItems}/>
  )
}
