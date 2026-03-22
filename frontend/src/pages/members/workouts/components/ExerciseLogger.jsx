import { Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { uid } from './helpers'
import SetRow from './SetRow'

export default function ExerciseLogger({ exercise, sets, onChangeSets }) {
  const doneCount = sets.filter(s => s.done).length

  function updateSet(updated) {
    onChangeSets(sets.map(s => s.id === updated.id ? updated : s))
  }
  function addSet() {
    onChangeSets([...sets, { id: uid(), weight: '', amount: '', done: false }])
  }
  function deleteSet(id) {
    onChangeSets(sets.filter(s => s.id !== id))
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <div>
          <p className="text-sm font-medium">{exercise.name || <span className="text-muted-foreground italic">Unnamed exercise</span>}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target: {exercise.sets} sets ×{' '}
            {exercise.repsType === 'reps' ? `${exercise.reps} reps` : `${exercise.time}s`}
            {' · '}rest {exercise.rest}
          </p>
        </div>
        <div className={cn(
          'text-xs font-medium tabular-nums px-2.5 py-1 rounded-full',
          doneCount === sets.length && sets.length > 0
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground'
        )}>
          {doneCount} / {sets.length}
        </div>
      </div>

      <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-3 px-4 py-2 border-b bg-muted/10">
        <span className="text-[11px] text-muted-foreground text-center">Set</span>
        <span className="text-[11px] text-muted-foreground">Weight</span>
        <span className="text-[11px] text-muted-foreground">
          {exercise.repsType === 'reps' ? 'Reps' : 'Time'}
        </span>
        <span className="text-[11px] text-muted-foreground text-center">Done</span>
        <span />
      </div>

      <div className="divide-y">
        <AnimatePresence>
          {sets.map((s, i) => (
            <SetRow
              key={s.id}
              setIndex={i}
              logSet={s}
              exercise={exercise}
              onChange={updateSet}
              onDelete={() => deleteSet(s.id)}
              isOnly={sets.length === 1}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2.5 border-t">
        <button onClick={addSet}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-[0.98]">
          <Plus size={12} strokeWidth={2} /> Add set
        </button>
      </div>
    </div>
  )
}
