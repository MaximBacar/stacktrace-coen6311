import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeUp, collapse } from './animations'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

const EMPTY_MEAL = { meal_type: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '' }

function MealRow({ meal, onDelete }) {
  return (
    <motion.div
      layout
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex items-center justify-between gap-3 py-1.5 group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{meal.name}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {meal.calories} kcal · P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
        </p>
      </div>
      <button
        onClick={() => onDelete(meal.id)}
        className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
      >
        <Trash2 size={12} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}

function AddMealForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY_MEAL)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({
      meal_type: form.meal_type,
      name:      form.name.trim(),
      calories:  Number(form.calories) || 0,
      protein:   Number(form.protein)  || 0,
      carbs:     Number(form.carbs)    || 0,
      fat:       Number(form.fat)      || 0,
    })
    setForm(EMPTY_MEAL)
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 pt-3 border-t">
      <div className="flex gap-2">
        <select
          value={form.meal_type}
          onChange={e => set('meal_type', e.target.value)}
          className="text-xs border rounded-md px-2 py-1.5 bg-background flex-shrink-0"
        >
          {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <input
          autoFocus
          placeholder="Food name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="flex-1 text-xs border rounded-md px-2 py-1.5 bg-background min-w-0"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[['calories', 'kcal'], ['protein', 'P g'], ['carbs', 'C g'], ['fat', 'F g']].map(([key, label]) => (
          <input
            key={key}
            type="number"
            min="0"
            placeholder={label}
            value={form[key]}
            onChange={e => set(key, e.target.value)}
            className="text-xs border rounded-md px-2 py-1.5 bg-background text-center tabular-nums"
          />
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">
          Cancel
        </button>
        <button
          type="submit"
          className="text-xs bg-foreground text-background rounded-md px-3 py-1 hover:opacity-80 transition-opacity"
        >
          Add
        </button>
      </div>
    </form>
  )
}

function DaySection({ planId, day, onAddMeal, onDeleteMeal, onDeleteDay, onRenameDay }) {
  const [open,     setOpen]     = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name,     setName]     = useState(day.name)

  const grouped = MEAL_TYPES.reduce((acc, t) => {
    acc[t] = (day.meals ?? []).filter(m => m.meal_type === t)
    return acc
  }, {})

  function submitRename(e) {
    e.preventDefault()
    if (name.trim() && name.trim() !== day.name) onRenameDay(day.id, name.trim())
    setRenaming(false)
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 gap-2">
        {renaming ? (
          <form onSubmit={submitRename} className="flex-1 min-w-0">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={submitRename}
              className="text-sm font-medium bg-transparent border-b border-foreground/40 outline-none w-full"
            />
          </form>
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="text-sm font-medium text-left flex-1 min-w-0 truncate hover:opacity-70 transition-opacity"
          >
            {day.name}
          </button>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setAdding(a => !a)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDeleteDay(day.id)}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
          <motion.button
            onClick={() => setOpen(o => !o)}
            animate={{ rotate: open ? 0 : -90 }}
            transition={spring}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown size={13} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            variants={collapse}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-4">
              {MEAL_TYPES.map(type => grouped[type].length > 0 && (
                <div key={type}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{type}</p>
                  <AnimatePresence>
                    {grouped[type].map(meal => (
                      <MealRow
                        key={meal.id}
                        meal={meal}
                        onDelete={(mealId) => onDeleteMeal(planId, day.id, mealId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ))}

              {(day.meals ?? []).length === 0 && !adding && (
                <p className="text-xs text-muted-foreground text-center py-2">No meals yet</p>
              )}

              {adding && (
                <AddMealForm
                  onAdd={(data) => { onAddMeal(planId, day.id, data); setAdding(false) }}
                  onCancel={() => setAdding(false)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function NutritionPlanEditor({
  plan,
  showActive = true,
  isSaving,
  isDirty,
  onSave,
  onRenamePlan,
  onUpdateTargets,
  onActivate,
  onAddDay,
  onRenameDay,
  onDeleteDay,
  onAddMeal,
  onDeleteMeal,
}) {
  const [name,     setName]     = useState(plan.name)
  const [targets,  setTargets]  = useState({
    calories: plan.target_calories,
    protein:  plan.target_protein,
    carbs:    plan.target_carbs,
    fat:      plan.target_fat,
  })

  function handleNameChange(e) {
    setName(e.target.value)
    onRenamePlan(e.target.value)
  }

  function handleTargetChange(key, val) {
    const updated = { ...targets, [key]: val }
    setTargets(updated)
    onUpdateTargets(updated)
  }

  return (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={spring}
      className="flex flex-col gap-5 h-full min-h-0 overflow-y-auto pr-1"
    >
      {/* Plan name + actions */}
      <div className="flex items-start justify-between gap-4">
        <input
          value={name}
          onChange={handleNameChange}
          className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-foreground/40 outline-none flex-1 min-w-0 transition-colors"
        />
        <div className="flex items-center gap-2 shrink-0">
          {showActive && !plan.is_active && (
            <button
              onClick={onActivate}
              className="text-xs border rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              Set active
            </button>
          )}
          {showActive && plan.is_active && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check size={12} strokeWidth={2} /> Active
            </span>
          )}
          {isDirty && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="text-xs bg-foreground text-background rounded-md px-3 py-1.5 hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Targets */}
      <div className="rounded-xl border p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Daily targets</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'calories', label: 'Calories', unit: 'kcal' },
            { key: 'protein',  label: 'Protein',  unit: 'g'    },
            { key: 'carbs',    label: 'Carbs',    unit: 'g'    },
            { key: 'fat',      label: 'Fat',      unit: 'g'    },
          ].map(({ key, label, unit }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{label} ({unit})</label>
              <input
                type="number"
                min="0"
                value={targets[key]}
                onChange={e => handleTargetChange(key, e.target.value)}
                className="text-sm border rounded-md px-2 py-1.5 bg-background tabular-nums text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Days</p>
          <motion.button
            onClick={onAddDay}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus size={15} strokeWidth={1.5} />
          </motion.button>
        </div>

        <AnimatePresence>
          {(plan.days ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed">
              No days yet — add one to get started
            </p>
          ) : (
            (plan.days ?? []).map(day => (
              <DaySection
                key={day.id}
                planId={plan.id}
                day={day}
                onAddMeal={onAddMeal}
                onDeleteMeal={onDeleteMeal}
                onDeleteDay={onDeleteDay}
                onRenameDay={onRenameDay}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
