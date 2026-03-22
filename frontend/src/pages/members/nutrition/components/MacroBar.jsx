import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springSlow } from './animations'

export default function MacroBar({ label, consumed, goal, color }) {
  const pct  = Math.min((consumed / goal) * 100, 100)
  const over = consumed > goal
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('text-xs font-medium tabular-nums', over && 'text-destructive')}>
          {consumed}<span className="text-muted-foreground font-normal"> / {goal}{label === 'Calories' ? ' kcal' : 'g'}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', over ? 'bg-destructive' : color)}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ ...springSlow, delay: 0.2 }}
        />
      </div>
    </div>
  )
}
