import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Trophy, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from './animations'
import { seedLogSets } from './helpers'
import { logWorkout } from '@/lib/api'
import ExerciseLogger from './ExerciseLogger'

export default function WorkoutLogger({ plans, onFinish }) {
  const [planId,   setPlanId]   = useState(plans[0]?.id ?? null)
  const [dayId,    setDayId]    = useState(null)
  const [logSets,  setLogSets]  = useState({})
  const [finished, setFinished] = useState(false)

  const plan = plans.find(p => p.id === planId)
  const day  = plan?.days.find(d => d.id === dayId) ?? null

  function selectDay(d) {
    setDayId(d.id)
    setLogSets(seedLogSets(d.exercises))
    setFinished(false)
  }

  function changeSetsForExercise(exId, newSets) {
    setLogSets(prev => ({ ...prev, [exId]: newSets }))
  }

  const totalDone = day
    ? day.exercises.reduce((acc, ex) => acc + (logSets[ex.id] ?? []).filter(s => s.done).length, 0)
    : 0

  const totalSets = day
    ? day.exercises.reduce((acc, ex) => acc + (logSets[ex.id] ?? []).length, 0)
    : 0

  const logMutation = useMutation({
    mutationFn: ({ planId, dayId, sets }) => logWorkout(planId, dayId, { sets }),
  })

  async function handleFinish() {
    const sets = []
    day.exercises.forEach(ex => {
      ;(logSets[ex.id] ?? []).filter(s => s.done).forEach(s => {
        sets.push({
          exercise_id: ex.id,
          weight: parseFloat(s.weight) || 0,
          ...(ex.repsType === 'reps'
            ? { reps: parseInt(s.amount) || 0 }
            : { duration: parseInt(s.amount) || 0 }
          ),
        })
      })
    })

    await logMutation.mutateAsync({ planId, dayId: day.id, sets })

    setFinished(true)
    onFinish()
  }

  if (!plan || plan.days.every(d => d.exercises.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="rounded-2xl border p-5 bg-muted/30">
          <ClipboardList size={28} strokeWidth={1.2} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No exercises in your plans</p>
          <p className="text-sm text-muted-foreground mt-1">Add exercises to a plan day before logging a workout.</p>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="flex flex-col items-center justify-center min-h-[40vh] gap-5 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="rounded-2xl border p-5 bg-foreground text-background"
        >
          <Trophy size={32} strokeWidth={1.2} />
        </motion.div>
        <div>
          <p className="font-semibold text-lg">Workout complete</p>
          <p className="text-sm text-muted-foreground mt-1">
            {day.label} · {totalDone} sets logged
          </p>
        </div>
        <Button variant="outline" onClick={() => { setDayId(null); setFinished(false) }}>
          Log another
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col h-full min-h-0 gap-6">

      {plans.length > 1 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Plan</p>
          <div className="flex gap-2 flex-wrap">
            {plans.map(p => (
              <button key={p.id} onClick={() => { setPlanId(p.id); setDayId(null) }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                  planId === p.id ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {p.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {plan && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Day</p>
          <div className="flex gap-2 flex-wrap">
            {plan.days.filter(d => d.exercises.length > 0).map(d => (
              <button key={d.id} onClick={() => selectDay(d)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                  dayId === d.id ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {d.label}
              </button>
            ))}
          </div>
          {plan.days.every(d => d.exercises.length === 0) && (
            <p className="text-xs text-muted-foreground">No days with exercises yet.</p>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <ScrollArea className="h-full min-h-0 px-4">
          {day ? (
            <motion.div key={day.id} variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-4">
              <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{plan.name} — {day.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalDone} of {totalSets} sets done</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleFinish}
                  disabled={totalDone === 0 || logMutation.isPending}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Trophy size={13} strokeWidth={1.5} />
                  Finish workout
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  animate={{ width: totalSets > 0 ? `${(totalDone / totalSets) * 100}%` : '0%' }}
                  transition={{ ...spring }}
                />
              </motion.div>

              {day.exercises.map(ex => (
                <motion.div key={ex.id} variants={fadeUp}>
                  <ExerciseLogger
                    exercise={ex}
                    sets={logSets[ex.id] ?? []}
                    onChangeSets={newSets => changeSetsForExercise(ex.id, newSets)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="pick"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center h-40 rounded-xl border border-dashed text-sm text-muted-foreground">
              Select a day to start logging
            </motion.div>
          )}
        </ScrollArea>
      </AnimatePresence>
    </motion.div>
  )
}
