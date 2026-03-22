import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { stagger, fadeUp } from './components/animations'
import { INITIAL_LOG, uid } from './components/data'
import MacroSummary from './components/MacroSummary'
import FoodLog from './components/FoodLog'
import MealPlan from './components/MealPlan'
import AddFoodSheet from './components/AddFoodSheet'

export default function NutritionPage() {
  const [log,         setLog]         = useState(INITIAL_LOG)
  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [defaultMeal, setDefaultMeal] = useState('Breakfast')

  const totals = useMemo(() =>
    log.reduce((acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }),
  [log])

  function openAdd(meal = 'Breakfast') { setDefaultMeal(meal); setSheetOpen(true) }
  function addEntry(entry)  { setLog(prev => [...prev, entry]) }
  function deleteEntry(id)  { setLog(prev => prev.filter(e => e.id !== id)) }
  function logAll(meal, items) {
    items.forEach(item => addEntry({ id: uid(), meal, ...item }))
  }

  return (
    <>
      <motion.div
        className="w-full h-full min-h-0 flex flex-col gap-8"
        variants={stagger(0.09)}
        initial="hidden"
        animate="show"
      >
        <MacroSummary totals={totals} />

        <div className="h-full min-h-0 overflow-y-scroll px-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          <motion.div variants={fadeUp}>
            <FoodLog log={log} onOpenAdd={openAdd} onDelete={deleteEntry} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <MealPlan onLogAll={logAll} />
          </motion.div>
        </div>
      </motion.div>

      <AddFoodSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        defaultMeal={defaultMeal}
        onAdd={addEntry}
      />
    </>
  )
}
