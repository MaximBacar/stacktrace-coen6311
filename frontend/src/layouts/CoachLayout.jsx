import { LayoutDashboard, User, GitPullRequestDraft, Calendar, Settings } from 'lucide-react'
import { CuSidebar } from './Sidebar'

const navItems = [
  { label: 'Dashboard', to: '/',        icon: LayoutDashboard },
  { label: 'Requests',  to: '/requests',icon: GitPullRequestDraft},
  { label: 'Clients',  to: '/clients',  icon: User           },
  { label: 'Calendar', to: '/nutrition',icon: Calendar           },
  { label: 'Settings',  to: '/settings',icon: Settings        },
]

export default function CoachLayout() {
  return (
    <CuSidebar navItems={navItems}/>
  )
}