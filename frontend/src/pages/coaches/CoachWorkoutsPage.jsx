import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Dumbbell, Users, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from '../members/workouts/components/animations'
import { DAY_LABELS, normalizePlan, restToSeconds } from '../members/workouts/components/helpers'
import {
  fetchWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan,
  addWorkoutDay, updateWorkoutDay, deleteWorkoutDay,
  addWorkoutExercise, updateWorkoutExercise, deleteWorkoutExercise,
  fetchPlanAssignments, assignPlanToClient, unassignPlanFromClient,
  fetchAssignedClients,
} from '@/lib/api'
import PlanEditor from '../members/workouts/components/PlanEditor'

const QK        = ['coach-workouts']
const ASSIGN_QK = (planId) => ['plan-assignments', planId]

// ─── Clients tab ─────────────────────────────────────────────────────────────

function ClientsTab({ planId }) {
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)

  const { data: assignments = [], isLoading: loadingAssign } = useQuery({
    queryKey: ASSIGN_QK(planId),
    queryFn:  () => fetchPlanAssignments(planId),
  })

  const { data: allClients = [] } = useQuery({
    queryKey: ['assignedClients'],
    queryFn:  fetchAssignedClients,
  })

  const unassigned = allClients.filter(
    c => !assignments.some(a => a.member_id === c.id)
  )

  const assignMutation = useMutation({
    mutationFn: (memberId) => assignPlanToClient(planId, memberId),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ASSIGN_QK(planId) })
      setAdding(false)
    },
  })

  const unassignMutation = useMutation({
    mutationFn: (memberId) => unassignPlanFromClient(planId, memberId),
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

export default function CoachWorkoutsPage() {
  const queryClient = useQueryClient()

  const [selectedId, setSelectedId] = useState(null)
  const [activeTab,  setActiveTab]  = useState('edit')
  const [dirtyIds,   setDirtyIds]   = useState(new Set())

  const markDirty = (planId) => setDirtyIds(prev => new Set([...prev, planId]))
  const markClean = (planId) => setDirtyIds(prev => { const next = new Set(prev); next.delete(planId); return next })

  const { data: rawPlans = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn: fetchWorkoutPlans,
    refetchOnWindowFocus: false,
  })

  // Only show coach-created templates (source_plan_id === null, no member assigned)
  const plans = useMemo(
    () => rawPlans.map(normalizePlan).filter(p => p.source_plan_id == null && p.member == null),
    [rawPlans]
  )

  const createMutation = useMutation({
    mutationFn: (name) => createWorkoutPlan({ name }),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(QK, old => [...(old ?? []), newPlan])
      setSelectedId(newPlan.id)
      setActiveTab('edit')
    },
  })

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => deleteWorkoutPlan(planId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData(QK, old => (old ?? []).filter(p => p.id !== planId))
      if (selectedId === planId) setSelectedId(null)
    },
  })

  const saveMutation = useMutation({
    onSuccess: (_, plan) => markClean(plan.id),
    mutationFn: async (plan) => {
      const results = await Promise.all([
        updateWorkoutPlan(plan.id, { name: plan.name }),
        ...plan.days.map(day => updateWorkoutDay(plan.id, day.id, { name: day.label })),
      ])

      for (const day of plan.days) {
        for (const ex of day.exercises) {
          if (!ex.name.trim()) continue
          const payload = {
            name:        ex.name,
            sets:        ex.sets,
            reps:        ex.repsType === 'reps' ? ex.reps : null,
            duration:    ex.repsType === 'time' ? ex.time : null,
            rest_time:   restToSeconds(ex.rest),
            order_index: ex.orderIndex ?? 0,
          }
          if (String(ex.id).startsWith('temp-')) {
            const newEx = await addWorkoutExercise(plan.id, day.id, payload)
            queryClient.setQueryData(QK, old =>
              (old ?? []).map(p => {
                if (p.id !== plan.id) return p
                return { ...p, days: (p.days ?? []).map(d => {
                  if (d.id !== day.id) return d
                  return { ...d, exercises: (d.exercises ?? []).map(e => e.id === ex.id ? newEx : e) }
                })}
              })
            )
          } else {
            await updateWorkoutExercise(plan.id, day.id, ex.id, payload)
          }
        }
      }
      return results
    },
  })

  const addDayMutation = useMutation({
    mutationFn: ({ planId, name, dayIndex }) => addWorkoutDay(planId, { name, day_index: dayIndex }),
    onSuccess: (newDay, { planId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId ? { ...p, days: [...(p.days ?? []), newDay] } : p)
      )
    },
  })

  const deleteDayMutation = useMutation({
    mutationFn: ({ planId, dayId }) => deleteWorkoutDay(planId, dayId),
    onSuccess: (_, { planId, dayId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => p.id === planId ? { ...p, days: (p.days ?? []).filter(d => d.id !== dayId) } : p)
      )
    },
  })

  const deleteExerciseMutation = useMutation({
    mutationFn: ({ planId, dayId, exId }) => deleteWorkoutExercise(planId, dayId, exId),
    onSuccess: (_, { planId, dayId, exId }) => {
      queryClient.setQueryData(QK, old =>
        (old ?? []).map(p => {
          if (p.id !== planId) return p
          return { ...p, days: (p.days ?? []).map(d =>
            d.id === dayId ? { ...d, exercises: (d.exercises ?? []).filter(e => e.id !== exId) } : d
          )}
        })
      )
    },
  })

  function handleRenamePlan(planId, name) {
    markDirty(planId)
    queryClient.setQueryData(QK, old => (old ?? []).map(p => p.id === planId ? { ...p, name } : p))
  }

  function handleRenameDay(planId, dayId, name) {
    markDirty(planId)
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => {
        if (p.id !== planId) return p
        return { ...p, days: (p.days ?? []).map(d => d.id === dayId ? { ...d, name } : d) }
      })
    )
  }

  function handleUpdateExercise(planId, dayId, exercise) {
    markDirty(planId)
    const payload = {
      name:        exercise.name,
      sets:        exercise.sets,
      reps:        exercise.repsType === 'reps' ? exercise.reps : null,
      duration:    exercise.repsType === 'time' ? exercise.time : null,
      rest_time:   restToSeconds(exercise.rest),
      order_index: exercise.orderIndex ?? 0,
    }
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => {
        if (p.id !== planId) return p
        return { ...p, days: (p.days ?? []).map(d => {
          if (d.id !== dayId) return d
          return { ...d, exercises: (d.exercises ?? []).map(e => e.id === exercise.id ? { ...e, ...payload } : e) }
        })}
      })
    )
  }

  function handleAddDay(planId) {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    const idx = plan.days.length + 1
    addDayMutation.mutate({ planId, name: `Day ${DAY_LABELS[plan.days.length] ?? idx}`, dayIndex: idx })
  }

  function handleAddExercise(planId, dayId) {
    markDirty(planId)
    const plan   = plans.find(p => p.id === planId)
    const day    = plan?.days.find(d => d.id === dayId)
    const tempId = `temp-${Date.now()}`
    const orderIndex = (day?.exercises.length ?? 0) + 1
    queryClient.setQueryData(QK, old =>
      (old ?? []).map(p => {
        if (p.id !== planId) return p
        return { ...p, days: (p.days ?? []).map(d =>
          d.id === dayId
            ? { ...d, exercises: [...(d.exercises ?? []), { id: tempId, name: '', sets: 3, reps: 10, rest_time: 60, order_index: orderIndex }] }
            : d
        )}
      })
    )
  }

  function handleSelectPlan(id) {
    setSelectedId(id)
    setActiveTab('edit')
  }

  const selectedPlan = plans.find(p => p.id === selectedId) ?? null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <motion.div className="h-full min-h-0 w-full flex flex-col px-6" variants={stagger()} initial="hidden" animate="show">

      <motion.div variants={fadeUp} className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

        {/* Left — plan list */}
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
                <Dumbbell size={22} strokeWidth={1.2} className="text-muted-foreground" />
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
                        {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deletePlanMutation.mutate(plan.id) }}
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

        {/* Right — editor or empty state */}
        <section className="h-full min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {!selectedPlan ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 text-center rounded-xl border border-dashed"
              >
                <div className="rounded-2xl border p-4 bg-muted/30">
                  <Dumbbell size={24} strokeWidth={1.2} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No plan selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Pick a plan from the list or create a new one.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                  <div className="flex-1 min-h-0">
                    <PlanEditor
                      key={selectedPlan.id}
                      plan={selectedPlan}
                      showActive={false}
                      isActive={false}
                      onSetActive={() => {}}
                      isAddingDay={addDayMutation.isPending}
                      isSaving={saveMutation.isPending}
                      isDirty={dirtyIds.has(selectedPlan.id)}
                      onSave={() => saveMutation.mutate(selectedPlan)}
                      onRenamePlan={(name) => handleRenamePlan(selectedPlan.id, name)}
                      onAddDay={() => handleAddDay(selectedPlan.id)}
                      onRenameDay={(dayId, name) => handleRenameDay(selectedPlan.id, dayId, name)}
                      onDeleteDay={(dayId) => deleteDayMutation.mutate({ planId: selectedPlan.id, dayId })}
                      onAddExercise={(dayId) => handleAddExercise(selectedPlan.id, dayId)}
                      onUpdateExercise={(dayId, ex) => handleUpdateExercise(selectedPlan.id, dayId, ex)}
                      onDeleteExercise={(dayId, exId) => deleteExerciseMutation.mutate({ planId: selectedPlan.id, dayId, exId })}
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
