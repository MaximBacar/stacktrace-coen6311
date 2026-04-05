import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from '../members/nutrition/components/animations'
import {
  fetchNutritionPlans, createNutritionPlan, updateNutritionPlan, deleteNutritionPlan,
  addNutritionDay, updateNutritionDay, deleteNutritionDay,
  addNutritionMeal, deleteNutritionMeal,
} from '@/lib/api'
import NutritionPlanEditor from '../members/nutrition/components/NutritionPlanEditor'

const QK = ['coach-nutrition-plans']

export default function CoachNutritionPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [dirtyIds,   setDirtyIds]   = useState(new Set())

  const markDirty = (id) => setDirtyIds(prev => new Set([...prev, id]))
  const markClean = (id) => setDirtyIds(prev => { const n = new Set(prev); n.delete(id); return n })

  const { data: plans = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn:  fetchNutritionPlans,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (plans.length > 0 && selectedId === null) setSelectedId(plans[0].id)
  }, [plans, selectedId])

  const createMutation = useMutation({
    mutationFn: (name) => createNutritionPlan({ name }),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(QK, old => [...(old ?? []), newPlan])
      setSelectedId(newPlan.id)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (planId) => deleteNutritionPlan(planId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData(QK, old => (old ?? []).filter(p => p.id !== planId))
      if (selectedId === planId) setSelectedId(null)
    },
  })

  const saveMutation = useMutation({
    onSuccess: (_, planId) => markClean(planId),
    mutationFn: (planId) => {
      const plan = queryClient.getQueryData(QK)?.find(p => p.id === planId)
      if (!plan) return
      return updateNutritionPlan(planId, {
        name:             plan.name,
        target_calories:  plan.target_calories,
        target_protein:   plan.target_protein,
        target_carbs:     plan.target_carbs,
        target_fat:       plan.target_fat,
      })
    },
  })

  const addDayMutation = useMutation({
    mutationFn: ({ planId, name, order }) => addNutritionDay(planId, { name, order }),
    onSuccess: (newDay, { planId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId ? { ...p, days: [...(p.days ?? []), newDay] } : p)
      )
    },
  })

  const renameDayMutation = useMutation({
    mutationFn: ({ planId, dayId, name }) => updateNutritionDay(planId, dayId, { name }),
    onSuccess: (updated, { planId, dayId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId
          ? { ...p, days: (p.days ?? []).map(d => d.id === dayId ? { ...d, name: updated.name } : d) }
          : p
        )
      )
    },
  })

  const deleteDayMutation = useMutation({
    mutationFn: ({ planId, dayId }) => deleteNutritionDay(planId, dayId),
    onSuccess: (_, { planId, dayId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId
          ? { ...p, days: (p.days ?? []).filter(d => d.id !== dayId) }
          : p
        )
      )
    },
  })

  const addMealMutation = useMutation({
    mutationFn: ({ planId, dayId, data }) => addNutritionMeal(planId, dayId, data),
    onSuccess: (newMeal, { planId, dayId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId
          ? { ...p, days: (p.days ?? []).map(d =>
              d.id === dayId ? { ...d, meals: [...(d.meals ?? []), newMeal] } : d
            )}
          : p
        )
      )
    },
  })

  const deleteMealMutation = useMutation({
    mutationFn: ({ planId, dayId, mealId }) => deleteNutritionMeal(planId, dayId, mealId),
    onSuccess: (_, { planId, dayId, mealId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId
          ? { ...p, days: (p.days ?? []).map(d =>
              d.id === dayId ? { ...d, meals: (d.meals ?? []).filter(m => m.id !== mealId) } : d
            )}
          : p
        )
      )
    },
  })

  function handleRenamePlan(planId, name) {
    markDirty(planId)
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => p.id === planId ? { ...p, name } : p)
    )
  }

  function handleUpdateTargets(planId, targets) {
    markDirty(planId)
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => p.id === planId
        ? { ...p,
            target_calories: targets.calories,
            target_protein:  targets.protein,
            target_carbs:    targets.carbs,
            target_fat:      targets.fat,
          }
        : p
      )
    )
  }

  function handleAddDay(planId) {
    const plan = plans.find(p => p.id === planId)
    const order = (plan?.days ?? []).length + 1
    addDayMutation.mutate({ planId, name: `Day ${order}`, order })
  }

  const selectedPlan = plans.find(p => p.id === selectedId) ?? null

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>
  )

  if (plans.length === 0) return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}
    >
      <div className="rounded-2xl border p-5 bg-muted/30">
        <UtensilsCrossed size={32} strokeWidth={1.2} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">No nutrition plans yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create plans to share with your clients.</p>
      </div>
      <Button onClick={() => createMutation.mutate('New plan')} disabled={createMutation.isPending} className="gap-2">
        <Plus size={15} strokeWidth={2} /> Create a plan
      </Button>
    </motion.div>
  )

  return (
    <motion.div
      className="h-full min-h-0 w-full flex flex-col px-6"
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium">My plans</h2>
            <motion.button
              onClick={() => createMutation.mutate('New plan')}
              disabled={createMutation.isPending}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Plus size={15} strokeWidth={1.5} />
            </motion.button>
          </div>

          <div className="divide-y rounded-xl border overflow-hidden">
            <AnimatePresence>
              {plans.map(plan => (
                <motion.div
                  key={plan.id}
                  layout
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  onClick={() => setSelectedId(plan.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-left transition-colors group cursor-pointer',
                    selectedId === plan.id ? 'bg-muted/60' : 'bg-card hover:bg-muted/30'
                  )}
                >
                  <div>
                    <p className={cn('text-sm', selectedId === plan.id ? 'font-medium' : '')}>{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(plan.days ?? []).length} day{(plan.days ?? []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(plan.id) }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>

        {/* Editor */}
        <section className="h-full min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedPlan ? (
              <NutritionPlanEditor
                key={selectedPlan.id}
                plan={selectedPlan}
                showActive={false}
                isDirty={dirtyIds.has(selectedPlan.id)}
                isSaving={saveMutation.isPending}
                onSave={() => saveMutation.mutate(selectedPlan.id)}
                onRenamePlan={(name) => handleRenamePlan(selectedPlan.id, name)}
                onUpdateTargets={(targets) => handleUpdateTargets(selectedPlan.id, targets)}
                onActivate={() => {}}
                onAddDay={() => handleAddDay(selectedPlan.id)}
                onRenameDay={(dayId, name) => renameDayMutation.mutate({ planId: selectedPlan.id, dayId, name })}
                onDeleteDay={(dayId) => deleteDayMutation.mutate({ planId: selectedPlan.id, dayId })}
                onAddMeal={(planId, dayId, data) => addMealMutation.mutate({ planId, dayId, data })}
                onDeleteMeal={(planId, dayId, mealId) => deleteMealMutation.mutate({ planId, dayId, mealId })}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center h-48 rounded-xl border border-dashed text-sm text-muted-foreground"
              >
                Select a plan to edit
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </motion.div>
  )
}
