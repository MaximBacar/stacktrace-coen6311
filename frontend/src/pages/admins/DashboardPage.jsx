import { Users, Dumbbell, ScrollText, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'

const stats = [
  { label: 'Total members',   value: '—', icon: Users,      desc: 'Registered gym members'          },
  { label: 'Active coaches',  value: '—', icon: Dumbbell,   desc: 'Coaches currently active'        },
  { label: 'Policies',        value: '—', icon: ScrollText,  desc: 'Gym policies on file'            },
  { label: 'Monthly bookings',value: '—', icon: TrendingUp,  desc: 'Coaching sessions this month'   },
]

export default function AdminDashboardPage() {
  return (
    <motion.div className="flex flex-col gap-8 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of gym activity and management.</p>
      </motion.div>

      <motion.div variants={stagger(0.07)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, desc }) => (
          <motion.div key={label} variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <Icon size={15} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border border-dashed flex items-center justify-center h-48 text-sm text-muted-foreground">
        Recent activity will appear here
      </motion.div>
    </motion.div>
  )
}
