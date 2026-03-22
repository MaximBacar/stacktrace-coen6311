import { Trash2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { fadeUp } from './animations'
import { REST_OPTIONS } from './helpers'

export default function ExerciseRow({ exercise, onChange, onDelete }) {
  return (
    <motion.div layout variants={fadeUp} initial="hidden" animate="show" exit="exit"
      className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center py-3 px-1"
    >
      <Input placeholder="Exercise name" value={exercise.name}
        onChange={e => onChange({ ...exercise, name: e.target.value })} className="h-8 text-sm" />
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-6 text-right">sets</span>
        <Input type="number" min={1} value={exercise.sets}
          onChange={e => onChange({ ...exercise, sets: Number(e.target.value) })}
          className="h-8 w-14 text-sm text-center" />
      </div>
      <div className="flex rounded-md border overflow-hidden h-8">
        <button onClick={() => onChange({ ...exercise, repsType: 'reps' })}
          className={cn('px-2.5 text-xs transition-colors',
            exercise.repsType === 'reps' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
          )}>Reps</button>
        <button onClick={() => onChange({ ...exercise, repsType: 'time' })}
          className={cn('px-2.5 text-xs transition-colors border-l',
            exercise.repsType === 'time' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
          )}>Time</button>
      </div>
      {exercise.repsType === 'reps' ? (
        <div className="flex items-center gap-1">
          <Input type="number" min={1} value={exercise.reps}
            onChange={e => onChange({ ...exercise, reps: Number(e.target.value) })}
            className="h-8 w-14 text-sm text-center" />
          <span className="text-xs text-muted-foreground">reps</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Input type="number" min={1} value={exercise.time}
            onChange={e => onChange({ ...exercise, time: Number(e.target.value) })}
            className="h-8 w-14 text-sm text-center" />
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Clock size={12} className="text-muted-foreground" />
        <select value={exercise.rest} onChange={e => onChange({ ...exercise, rest: e.target.value })}
          className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {REST_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <button onClick={onDelete}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-95">
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}