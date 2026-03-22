import { useState } from 'react'
import { Plus, UtensilsCrossed, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring, collapse } from './animations'
import { TODAY_PLAN, uid } from './data'

export default function MealPlan({ onLogAll }) {
  const [planOpen, setPlanOpen] = useState(true)

  return (
    <motion.aside className="rounded-xl border overflow-hidden">
      <button
        onClick={() => setPlanOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3 bg-muted/40"
      >
        <p className="text-sm font-medium">Today's meal plan</p>
        <motion.span animate={{ rotate: planOpen ? 0 : -90 }} transition={spring}>
          <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {planOpen ? (
          <motion.div
            key="plan"
            variants={collapse}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden divide-y"
          >
            {TODAY_PLAN.map(section => (
              <div key={section.meal} className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">{section.meal}</p>
                <div className="flex flex-col gap-2">
                  {section.items.map(item => (
                    <div key={item.name} className="flex items-start justify-between gap-2">
                      <p className="text-xs leading-snug">{item.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs tabular-nums text-muted-foreground">{item.calories}</span>
                        <span className="text-[10px] text-muted-foreground">kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onLogAll(section.meal, section.items)}
                  className="mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Plus size={11} strokeWidth={2} />
                  Log all
                </button>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-muted-foreground"
          >
            <UtensilsCrossed size={14} strokeWidth={1.5} />
            Plan hidden
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
