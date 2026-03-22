import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring, fadeUp, collapse } from './animations'

export default function MealSection({ meal, entries, onAdd, onDelete }) {
  const [open, setOpen] = useState(true)
  const totalCalories = entries.reduce((acc, e) => acc + e.calories, 0)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 group"
      >
        <div className="flex items-center gap-2">
          <motion.span animate={{ rotate: open ? 0 : -90 }} transition={spring}>
            <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground" />
          </motion.span>
          <span className="text-sm font-medium">{meal}</span>
          <AnimatePresence>
            {entries.length > 0 && (
              <motion.span
                key={totalCalories}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={spring}
                className="text-xs text-muted-foreground"
              >
                {totalCalories} kcal
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onAdd(meal) }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 pr-1"
        >
          <Plus size={12} strokeWidth={2} />
          Add
        </button>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            variants={collapse}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden ml-5"
          >
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nothing logged yet</p>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden mb-2">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-1.5 text-[11px] text-muted-foreground bg-muted/30">
                  <span>Food</span>
                  <span className="w-14 text-right">kcal</span>
                  <span className="w-12 text-right">P</span>
                  <span className="w-12 text-right">C</span>
                  <span className="w-12 text-right">F</span>
                  <span className="w-5" />
                </div>
                <AnimatePresence>
                  {entries.map(e => (
                    <motion.div
                      key={e.id}
                      layout
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-4 py-2.5 bg-card group/row"
                    >
                      <span className="truncate text-sm">{e.name}</span>
                      <span className="w-14 text-right tabular-nums text-xs">{e.calories}</span>
                      <span className="w-12 text-right tabular-nums text-xs text-muted-foreground">{e.protein}g</span>
                      <span className="w-12 text-right tabular-nums text-xs text-muted-foreground">{e.carbs}g</span>
                      <span className="w-12 text-right tabular-nums text-xs text-muted-foreground">{e.fat}g</span>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="w-5 flex justify-end text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover/row:opacity-100"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
