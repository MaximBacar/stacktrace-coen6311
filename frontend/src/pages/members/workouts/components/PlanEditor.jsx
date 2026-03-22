import { Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fadeUp, stagger } from './animations'
import { makeDay } from './helpers'
import DayPanel from './DayPanel'

export default function PlanEditor({ plan, onUpdate, onSetActive, isActive }) {
  function updateDay(u)  { onUpdate({ ...plan, days: plan.days.map(d => d.id === u.id ? u : d) }) }
  function deleteDay(id) { onUpdate({ ...plan, days: plan.days.filter(d => d.id !== id) }) }
  function addDay()      { onUpdate({ ...plan, days: [...plan.days, makeDay(plan.days.length)] }) }

  return (
    <motion.div key={plan.id} variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6 h-full">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <Input value={plan.name} onChange={e => onUpdate({ ...plan, name: e.target.value })}
          className="text-xl font-semibold tracking-tight border-transparent bg-transparent px-0 h-auto focus:bg-background focus:border-border focus:px-3 w-72" />
        <Button size="sm" variant={isActive ? 'default' : 'outline'} onClick={onSetActive} className="gap-1.5 h-8 text-xs">
          {isActive && <Check size={12} strokeWidth={2.5} />}
          {isActive ? 'Active plan' : 'Set as active'}
        </Button>
      </motion.div>
      <ScrollArea className="h-full min-h-0 px-4">
        <motion.div variants={stagger} className="flex flex-col gap-3">
          <AnimatePresence>
            {plan.days.map(day => (
              <DayPanel key={day.id} day={day} onUpdateDay={updateDay} onDeleteDay={() => deleteDay(day.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
        <motion.button variants={fadeUp} onClick={addDay} whileTap={{ scale: 0.97 }}
          className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start">
          <Plus size={15} strokeWidth={1.5} /> Add day
        </motion.button>
      </ScrollArea>
    </motion.div>
  )
}