import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fetchWorkoutLogs } from '@/lib/api'
import { spring, fadeUp, stagger, collapse } from './animations'

function groupSetsByExercise(sets) {
  const map = {}
  sets.forEach(s => {
    if (!map[s.exercise_name]) map[s.exercise_name] = []
    map[s.exercise_name].push(s)
  })
  return Object.entries(map)
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function LogCard({ log }) {
  const [open, setOpen] = useState(false)
  const grouped = groupSetsByExercise(log.sets)
  const totalSets = log.sets.length

  return (
    <motion.div layout variants={fadeUp} className="rounded-xl border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium">{log.plan_name} — {log.day_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(log.created_at)} · {formatTime(log.created_at)} · {totalSets} set{totalSets !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={spring} className="text-muted-foreground">
          <ChevronDown size={15} strokeWidth={1.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" variants={collapse} initial="hidden" animate="show" exit="exit" className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              {grouped.map(([exerciseName, sets]) => (
                <div key={exerciseName}>
                  <p className="text-xs font-medium mb-1.5">{exerciseName}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sets.map((s, i) => (
                      <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                        <span className="text-muted-foreground">#{i + 1}</span>
                        <span>{parseFloat(s.weight)} kg</span>
                        <span className="text-muted-foreground">·</span>
                        {s.reps != null
                          ? <span>{s.reps} reps</span>
                          : <span>{s.duration}s</span>
                        }
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LogHistory() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['workout-logs'],
    queryFn: fetchWorkoutLogs,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="rounded-2xl border p-5 bg-muted/30">
          <ClipboardList size={28} strokeWidth={1.2} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No workouts logged yet</p>
          <p className="text-sm text-muted-foreground mt-1">Finish a workout session to see your history here.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">
      {logs.map(log => (
        <LogCard key={log.id} log={log} />
      ))}
    </motion.div>
  )
}
