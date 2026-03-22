import { motion } from 'framer-motion'
import { spring, fadeUp } from './animations'
import { GOALS } from './data'
import MacroBar from './MacroBar'

export default function MacroSummary({ totals }) {
  return (
    <motion.section variants={fadeUp} className="flex flex-col gap-5 px-6">
      <div className="flex items-end justify-between">
        <div>
          <motion.p
            key={totals.calories}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="text-3xl font-semibold tracking-tight tabular-nums"
          >
            {totals.calories}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-0.5">of {GOALS.calories} kcal</p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {Math.max(GOALS.calories - totals.calories, 0)} kcal remaining
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 rounded-xl border p-5">
        <MacroBar label="Protein" consumed={totals.protein} goal={GOALS.protein} color="bg-blue-500" />
        <MacroBar label="Carbs"   consumed={totals.carbs}   goal={GOALS.carbs}   color="bg-amber-400" />
        <MacroBar label="Fat"     consumed={totals.fat}     goal={GOALS.fat}     color="bg-rose-400" />
      </div>
    </motion.section>
  )
}
