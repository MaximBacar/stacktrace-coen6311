import { Plus, Check, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fadeUp, stagger } from './animations'
import DayPanel from './DayPanel'

export default function PlanEditor({
  plan,
  isActive, onSetActive, showActive = true,
  isAddingDay,
  isSaving, isDirty, onSave,
  onRenamePlan,
  onAddDay,
  onRenameDay,
  onDeleteDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}) {
  return (
    <motion.div key={plan.id} variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6 h-full">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <Input
          value={plan.name}
          onChange={e => onRenamePlan(e.target.value)}
          className="text-xl font-semibold tracking-tight border-transparent bg-transparent px-0 h-auto focus:bg-background focus:border-border focus:px-3 w-72"
        />
        <div className="flex items-center gap-2">
          {showActive && (
            <Button size="sm" variant={isActive ? 'default' : 'outline'} onClick={onSetActive} className="gap-1.5 h-8 text-xs">
              {isActive && <Check size={12} strokeWidth={2.5} />}
              {isActive ? 'Active plan' : 'Set as active'}
            </Button>
          )}
          <Button size="sm" onClick={onSave} disabled={isSaving || !isDirty} className="gap-1.5 h-8 text-xs">
            <Save size={12} strokeWidth={2} />
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </motion.div>

      <ScrollArea className="h-full min-h-0 px-4">
        <motion.div variants={stagger} className="flex flex-col gap-3">
          <AnimatePresence>
            {plan.days.map(day => (
              <DayPanel
                key={day.id}
                day={day}
                onRenameDay={(name) => onRenameDay(day.id, name)}
                onDeleteDay={() => onDeleteDay(day.id)}
                onAddExercise={() => onAddExercise(day.id)}
                onUpdateExercise={(ex) => onUpdateExercise(day.id, ex)}
                onDeleteExercise={(exId) => onDeleteExercise(day.id, exId)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        <motion.button variants={fadeUp} onClick={onAddDay} disabled={isAddingDay} whileTap={{ scale: 0.97 }}
          className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start disabled:opacity-50">
          <Plus size={15} strokeWidth={1.5} /> {isAddingDay ? 'Adding…' : 'Add day'}
        </motion.button>
      </ScrollArea>
    </motion.div>
  )
}