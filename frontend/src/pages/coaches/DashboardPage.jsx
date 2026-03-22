import { Users, CalendarCheck, Star, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Active clients',      value: '—', icon: Users,         desc: 'Members currently working with you' },
  { label: 'Sessions this month', value: '—', icon: CalendarCheck, desc: 'Completed coaching sessions'         },
  { label: 'Avg. rating',         value: '—', icon: Star,          desc: 'Based on member feedback'           },
  { label: 'Acceptance rate',     value: '—', icon: TrendingUp,    desc: 'Requests accepted vs. total'        },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your coaching activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, desc }) => (
          <div key={label} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <Icon size={15} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed flex items-center justify-center h-48 text-sm text-muted-foreground">
        Recent activity will appear here
      </div>
    </div>
  )
}
