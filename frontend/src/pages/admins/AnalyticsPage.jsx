import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, TrendingUp, Activity } from 'lucide-react'
import { fadeUp, stagger } from './animations'
import { fetchPeakHours } from '../../lib/api'

// Color logic mirrors the original template: >2 = red, >1 = yellow, else green
function barColor(count) {
  if (count > 2) return { bg: 'bg-red-400',    print: '#f87171' }
  if (count > 1) return { bg: 'bg-yellow-400', print: '#facc15' }
  return           { bg: 'bg-green-400',   print: '#4ade80' }
}

function BarChart({ countData, percentages }) {
  const maxCount = Math.max(...countData, 1)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Bars */}
        <div className="flex items-end gap-[2px] h-48 px-1">
          {countData.map((count, hour) => {
            const heightPct = (count / maxCount) * 100
            const { bg } = barColor(count)
            return (
              <div key={hour} className="flex-1 flex flex-col items-center justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                  <div className="bg-popover border rounded px-2 py-1 text-xs text-popover-foreground shadow whitespace-nowrap">
                    {count} booking{count !== 1 ? 's' : ''} · {percentages[hour]}%
                  </div>
                </div>
                <div
                  className={`w-full rounded-t ${bg} transition-all`}
                  style={{ height: `${heightPct}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
              </div>
            )
          })}
        </div>

        {/* X-axis labels — every 3 hours */}
        <div className="flex gap-[2px] px-1 mt-1">
          {countData.map((_, hour) => (
            <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground">
              {hour % 3 === 0 ? `${hour}h` : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [membershipType, setMembershipType] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchPeakHours(date, membershipType)
      .then(setData)
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setLoading(false))
  }, [date, membershipType])

  const avgRate = data
    ? (() => {
        const active = data.percentage_data.filter(p => p > 0)
        return active.length > 0
          ? (active.reduce((a, b) => a + b, 0) / active.length).toFixed(1)
          : '0'
      })()
    : '—'

  const peakRate = data ? Math.max(...data.percentage_data).toFixed(1) : '—'

  return (
    <motion.div
      className="flex flex-col gap-6 px-6 print:px-0"
      variants={stagger()}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Gym peak hours and booking insights.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
        >
          <Printer size={14} />
          Export PDF
        </button>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger(0.07)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg. Booking Rate</span>
            <Activity size={15} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{loading ? '…' : `${avgRate}%`}</p>
          <p className="text-xs text-muted-foreground">Average occupancy across active hours</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Peak Occupancy</span>
            <TrendingUp size={15} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{loading ? '…' : `${peakRate}%`}</p>
          <p className="text-xs text-muted-foreground">Highest occupancy recorded for the day</p>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="print:hidden flex flex-wrap gap-3 items-center p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Membership</label>
          <select
            value={membershipType}
            onChange={e => setMembershipType(e.target.value)}
            className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Types</option>
            <option value="member">Member</option>
            <option value="coach">Coach</option>
          </select>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Bookings by Hour</h2>
          <span className="text-xs text-muted-foreground">{data?.selected_date ?? date}</span>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        )}

        {!error && loading && (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}

        {!error && !loading && data && (
          <BarChart countData={data.count_data} percentages={data.percentage_data} />
        )}

        {/* Legend */}
        {!error && !loading && (
          <div className="flex justify-center gap-6 mt-4">
            {[
              { label: 'Low',      bg: 'bg-green-400'  },
              { label: 'Moderate', bg: 'bg-yellow-400' },
              { label: 'Peak',     bg: 'bg-red-400'    },
            ].map(({ label, bg }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-3 h-3 rounded-sm ${bg}`} />
                {label}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}