import { CalendarDays, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring, fadeUp } from './animations'

export default function UpcomingSessions({ sessions }) {
  return (
    <motion.section variants={fadeUp}>
      <h2 className="text-sm font-medium mb-4">Upcoming sessions</h2>
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
          No sessions booked yet
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          <AnimatePresence>
            {sessions.map(s => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={spring}
                className="shrink-0 w-64 rounded-xl border bg-card p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.coachName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium leading-tight">{s.coachName}</p>
                    <p className="text-xs text-muted-foreground">{s.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} strokeWidth={1.5} />
                    {s.day}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={1.5} />
                    {s.time} · {s.duration} min
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  )
}