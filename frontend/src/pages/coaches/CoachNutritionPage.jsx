import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, UtensilsCrossed, Users, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from '../members/nutrition/components/animations'
import {
  fetchNutritionPlans, createNutritionPlan, updateNutritionPlan, deleteNutritionPlan,
  addNutritionDay, updateNutritionDay, deleteNutritionDay,
  addNutritionMeal, deleteNutritionMeal,
  fetchNutritionPlanAssignments, assignNutritionPlanToClient, unassignNutritionPlanFromClient,
  fetchAssignedClients,
} from '@/lib/api'
import NutritionPlanEditor from '../members/nutrition/components/NutritionPlanEditor'

const QK        = ['coach-nutrition-plans']
const ASSIGN_QK = (planId) => ['nutrition-plan-assignments', planId]

// ─── Clients tab ─────────────────────────────────────────────────────────────

function ClientsTab({ planId }) {
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)

  const { data: assignments = [], isLoading: loadingAssign } = useQuery({
    queryKey: ASSIGN_QK(planId),
    queryFn:  () => fetchNutritionPlanAssignments(planId),
  })

  const { data: allClients = [] } = useQuery({
    queryKey: ['assignedClients'],
    queryFn:  fetchAssignedClients,
  })

  const unassigned = allClients.filter(c => !assignments.some(a => a.member_id === c.id))

  const assignMutation = useMutation({
    mutationFn: (memberId) => assignNutritionPlanToClient(planId, memberId),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ASSIGN_QK(planId) })
      setAdding(false)
    },
  })

  const unassignMutation = useMutation({
    mutationFn: (memberId) => unassignNutritionPlanFromClient(planId, memberId),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ASSIGN_QK(planId) }),
  })

  if (loadingAssign) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        {[...Array(2)].map((_, i) => <div key={i} className="h-12 rounded-xl border bg-muted/30 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {assignments.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="rounded-2xl border p-4 bg-muted/30">
            <Users size={20} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No clients assigned yet.</p>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="gap-1.5">
            <Plus size={13} strokeWidth={2} /> Assign a client
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {assignments.map(a => (
              <div key={a.member_id} className="flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {a.member_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.member_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.member_email}</p>
                  </div>
                </div>
                <button
                  onClick={() => unassignMutation.mutate(a.member_id)}
                  disabled={unassignMutation.isPending}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>

          {!adding && unassigned.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="gap-1.5 self-start">
              <Plus size={13} strokeWidth={2} /> Assign client
            </Button>
          )}

          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div className="rounded-xl border p-4 flex flex-col gap-3">
                  <p className="text-sm font-medium">Select a client</p>
                  {unassigned.length === 0 ? (
                    <p className="text-xs text-muted-foreground">All your clients already have this plan assigned.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {unassigned.map(c => (
                        <button
                          key={c.id}
                          onClick={() => assignMutation.mutate(c.id)}
                          disabled={assignMutation.isPending}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/40 transition-colors disabled:opacity-50"
                        >
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                            {c.first_name?.[0]}{c.last_name?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{c.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="self-start">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoachNutritionPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab,  setActiveTab]  = useState('edit')
  const [dirtyIds,   setDirtyIds]   = useState(new Set())

  const markDirty = (id) => setDirtyIds(prev => new Set([...prev, id]))
  const markClean = (id) => setDirtyIds(prev => { const n = new Set(prev); n.delete(id); return n })

  const { data: rawPlans = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn:  fetchNutritionPlans,
    refetchOnWindowFocus: false,
  })

  // Only coach-created templates (no source_plan, no member)
  const plans = rawPlans.filter(p => p.source_plan_id == null && p.member == null)

  const createMutation = useMutation({
    mutationFn: (name) => createNutritionPlan({ name }),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(QK, old => [...(old ?? []), newPlan])
      setSelectedId(newPlan.id)
      setActiveTab('edit')
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
        name:            plan.name,
        target_calories: plan.target_calories,
        target_protein:  plan.target_protein,
        target_carbs:    plan.target_carbs,
        target_fat:      plan.target_fat,
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
    queryClient.setQueryData(QK, old => (old ?? []).map(p => p.id === planId ? { ...p, name } : p))
  }

  function handleUpdateTargets(planId, targets) {
    markDirty(planId)
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => p.id === planId
        ? { ...p, target_calories: targets.calories, target_protein: targets.protein, target_carbs: targets.carbs, target_fat: targets.fat }
        : p
      )
    )
  }

  function handleAddDay(planId) {
    const plan  = plans.find(p => p.id === planId)
    const order = (plan?.days ?? []).length + 1
    addDayMutation.mutate({ planId, name: `Day ${order}`, order })
  }

  function handleSelectPlan(id) {
    setSelectedId(id)
    setActiveTab('edit')
  }

  const selectedPlan = plans.find(p => p.id === selectedId) ?? null

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>
  )

  return (
    <motion.div className="h-full min-h-0 w-full flex flex-col px-6" variants={stagger(0.07)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

        {/* Sidebar */}
        <aside className="flex flex-col gap-3 min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">My plans</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => createMutation.mutate('New plan')}
              disabled={createMutation.isPending}
              className="gap-1.5 h-7 text-xs px-2.5"
            >
              <Plus size={12} strokeWidth={2} />
              New Plan
            </Button>
          </div>

          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="rounded-2xl border p-4 bg-muted/30">
                <UtensilsCrossed size={22} strokeWidth={1.2} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No plans yet. Create one to get started.</p>
            </div>
          ) : (
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
                    onClick={() => handleSelectPlan(plan.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left transition-colors group cursor-pointer',
                      selectedId === plan.id ? 'bg-muted/60' : 'bg-card hover:bg-muted/30'
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn('text-sm truncate', selectedId === plan.id ? 'font-medium' : '')}>{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(plan.days ?? []).length} day{(plan.days ?? []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMutation.mutate(plan.id) }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 ml-2"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </aside>

        {/* Editor or empty state */}
        <section className="h-full min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {!selectedPlan ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 text-center rounded-xl border border-dashed"
              >
                <div className="rounded-2xl border p-4 bg-muted/30">
                  <UtensilsCrossed size={24} strokeWidth={1.2} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No plan selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Pick a plan from the list or create a new one.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-0 flex flex-col"
              >
                {/* Tab bar */}
                <div className="flex gap-1 mb-4 shrink-0">
                  {[
                    { key: 'edit',    label: 'Edit plan' },
                    { key: 'clients', label: 'Assigned clients' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs transition-colors',
                        activeTab === t.key
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'edit' && (
                  <div className="flex-1 min-h-0 overflow-y-auto">
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
                  </div>
                )}

                {activeTab === 'clients' && (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <ClientsTab planId={selectedPlan.id} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </motion.div>
    </motion.div>
  )
}
