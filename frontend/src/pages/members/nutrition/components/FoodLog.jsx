import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeUp } from './animations'
import { MEALS } from './data'
import MealSection from './MealSection'

export default function FoodLog({ log, onOpenAdd, onDelete }) {
  return (
    <motion.section variants={fadeUp} className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">Today's log</h2>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => onOpenAdd()}>
          <Plus size={13} strokeWidth={2} />
          Log food
        </Button>
      </div>
      <div className="divide-y">
        {MEALS.map(meal => (
          <MealSection
            key={meal}
            meal={meal}
            entries={log.filter(e => e.meal === meal)}
            onAdd={onOpenAdd}
            onDelete={onDelete}
          />
        ))}
      </div>
    </motion.section>
  )
}
