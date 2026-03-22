import { Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { fadeUp } from './animations'

export default function SetRow({ setIndex, logSet, exercise, onChange, onDelete, isOnly }) {
  const isTime = exercise.repsType === 'time'

  return (
    <motion.div layout variants={fadeUp} initial="hidden" animate="show" exit="exit"
      className={cn(
        'grid items-center gap-3 py-2.5 px-4 transition-colors',
        'grid-cols-[2rem_1fr_1fr_2rem_2rem]',
        logSet.done ? 'bg-muted/40' : ''
      )}
    >
      <span className={cn('text-xs font-medium tabular-nums text-center', logSet.done ? 'text-muted-foreground' : '')}>
        {setIndex + 1}
      </span>

      <div className="relative">
        <Input
          type="number" min={0} step={0.5}
          placeholder={logSet.done ? '—' : '0'}
          value={logSet.weight}
          onChange={e => onChange({ ...logSet, weight: e.target.value })}
          disabled={logSet.done}
          className="h-8 text-sm pr-8 disabled:opacity-60"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
          kg
        </span>
      </div>

      <div className="relative">
        <Input
          type="number" min={0}
          placeholder={isTime ? String(exercise.time) : String(exercise.reps)}
          value={logSet.amount}
          onChange={e => onChange({ ...logSet, amount: e.target.value })}
          disabled={logSet.done}
          className="h-8 text-sm pr-8 disabled:opacity-60"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
          {isTime ? 's' : 'reps'}
        </span>
      </div>

      <button
        onClick={() => onChange({ ...logSet, done: !logSet.done })}
        className={cn(
          'w-7 h-7 rounded-md border flex items-center justify-center transition-all active:scale-90',
          logSet.done
            ? 'bg-foreground border-foreground text-background'
            : 'text-muted-foreground hover:border-foreground/40'
        )}
      >
        <Check size={13} strokeWidth={2.5} />
      </button>

      <button
        onClick={onDelete}
        disabled={isOnly}
        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20"
      >
        <Trash2 size={13} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}
