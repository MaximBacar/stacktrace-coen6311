import { useQuery } from '@tanstack/react-query'
import { Users, Dumbbell, ScrollText, TrendingUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'
import { fetchAdminStats } from '@/lib/api'

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusPill(status) {
  const map = {
    accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    booked:   'bg-blue-500/10    text-blue-600    border-blue-500/20',
    canceled: 'bg-red-500/10     text-red-600     border-red-500/20',
    rejected: 'bg-red-500/10     text-red-600     border-red-500/20',
    pending:  'bg-amber-500/10   text-amber-600   border-amber-500/20',
  }
  return map[status] ?? 'bg-muted text-muted-foreground border-border'
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  fetchAdminStats,
  })

  const stats = [
    {
      label: 'Total members',
      value: isLoading ? '—' : String(data?.member_count ?? 0),
      icon:  Users,
      desc:  'Registered gym members',
    },
    {
      label: 'Active coaches',
      value: isLoading ? '—' : String(data?.coach_count ?? 0),
      icon:  Dumbbell,
      desc:  'Approved and active coaches',
    },
    {
      label: 'Policies',
      value: isLoading ? '—' : String(data?.policy_count ?? 0),
      icon:  ScrollText,
      desc:  'Gym policies on file',
    },
    {
      label: 'Monthly bookings',
      value: isLoading ? '—' : String(data?.monthly_sessions ?? 0),
      icon:  TrendingUp,
      desc:  'Coaching sessions this month',
    },
  ]

  return (
    <motion.div className="flex flex-col gap-8 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of gym activity and management.</p>
      </motion.div>

      {/* Stat cards */}
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

      {/* Open equipment issues alert */}
      {!isLoading && data?.open_issues > 0 && (
        <motion.div variants={fadeUp} className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <AlertTriangle size={15} strokeWidth={1.5} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-medium">{data.open_issues} equipment issue{data.open_issues !== 1 ? 's' : ''}</span> open and awaiting resolution.
          </p>
        </motion.div>
      )}

      <motion.div variants={stagger(0.06)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent members */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-medium mb-3">Recent members</h2>
          <div className="rounded-xl border overflow-hidden divide-y">
            {isLoading ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">Loading…</div>
            ) : data?.recent_members?.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No members yet</div>
            ) : data?.recent_members?.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-card">
                <div>
                  <p className="text-sm font-medium">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">{fmt(m.created_at)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent sessions */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-medium mb-3">Recent sessions</h2>
          <div className="rounded-xl border overflow-hidden divide-y">
            {isLoading ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">Loading…</div>
            ) : data?.recent_sessions?.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No sessions yet</div>
            ) : data?.recent_sessions?.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-card">
                <div>
                  <p className="text-sm font-medium">{s.member_name}</p>
                  <p className="text-xs text-muted-foreground">with {s.coach_name} · {s.scheduled_slot}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusPill(s.status)}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  )
}