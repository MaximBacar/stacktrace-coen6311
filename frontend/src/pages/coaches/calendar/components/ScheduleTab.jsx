import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fetchCoachSessions } from '@/lib/api'
import { fadeUp } from '../../animations'
import WeekGrid from './WeekGrid'
import { slotKey } from './constants'

export default function ScheduleTab() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['coach-sessions'],
    queryFn: fetchCoachSessions,
    refetchOnWindowFocus: false,
  })

  // Map slotKey → session for quick lookup
  const sessionMap = {}
  sessions.forEach(s => { sessionMap[s.scheduled_slot] = s })

  function renderCell(day, time) {
    const session = sessionMap[slotKey(day, time)]
    if (!session) return null

    const isPending = session.status === 'booked'

    return (
      <div
        title={`${session.member_name} — ${session.goals || 'No goals specified'}\nStatus: ${session.status}`}
        className={cn(
          'absolute inset-0 flex items-center px-1 overflow-hidden',
          isPending
            ? 'bg-amber-500/15 border border-dashed border-amber-500'
            : 'bg-emerald-500/15 border border-emerald-500'
        )}
      >
        <span className="text-[10px] font-medium truncate leading-none">
          {session.member_name}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <motion.div className="flex flex-col gap-4 h-full min-h-0" variants={fadeUp} initial="hidden" animate="show">
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm border border-dashed border-amber-500 bg-amber-500/15" />
          Pending request
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm border border-emerald-500 bg-emerald-500/15" />
          Accepted
        </div>
      </div>

      <WeekGrid renderCell={renderCell} />
    </motion.div>
  )
}
