import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { spring, fadeUp, collapse } from './animations'
import ExerciseRow from './ExerciseRow'

export default function DayPanel({ day, onRenameDay, onDeleteDay, onAddExercise, onUpdateExercise, onDeleteExercise }) {
  const [open, setOpen] = useState(true)

  return (
    <motion.div layout className="rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors">
          <motion.span animate={{ rotate: open ? 0 : -90 }} transition={spring}>
            <ChevronDown size={15} strokeWidth={1.5} />
          </motion.span>
          <Input
            value={day.label}
            onChange={e => onRenameDay(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-7 w-28 text-sm font-medium border-transparent bg-transparent px-1 focus:bg-background focus:border-border"
          />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          </span>
          <button onClick={onDeleteDay}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" variants={collapse} initial="hidden" animate="show" exit="exit" className="overflow-hidden">
            <div className="px-3">
              {day.exercises.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No exercises yet — add one below</p>
              ) : (
                <div className="divide-y">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center py-2 px-1">
                    <span className="text-[11px] text-muted-foreground">Exercise</span>
                    <span className="text-[11px] text-muted-foreground w-20 text-right">Sets</span>
                    <span className="text-[11px] text-muted-foreground w-[5.5rem]">Mode</span>
                    <span className="text-[11px] text-muted-foreground w-[5rem]">Amount</span>
                    <span className="text-[11px] text-muted-foreground w-20">Rest</span>
                    <span className="w-7" />
                  </div>
                  <AnimatePresence>
                    {day.exercises.map(ex => (
                      <ExerciseRow key={ex.id} exercise={ex}
                        onChange={onUpdateExercise}
                        onDelete={() => onDeleteExercise(ex.id)} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
              <div className="py-3">
                <button onClick={onAddExercise}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-[0.98]">
                  <Plus size={13} strokeWidth={2} /> Add exercise
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}