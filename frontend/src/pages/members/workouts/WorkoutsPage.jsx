import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Dumbbell, ClipboardList, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from './components/animations'
import { DAY_LABELS, normalizePlan, restToSeconds } from './components/helpers'
import {
  fetchWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan,
  addWorkoutDay, updateWorkoutDay, deleteWorkoutDay,
  addWorkoutExercise, updateWorkoutExercise, deleteWorkoutExercise,
} from '@/lib/api'
import PlanEditor from './components/PlanEditor'
import WorkoutLogger from './components/WorkoutLogger'
import LogHistory from './components/LogHistory'

const TABS = [
  { key: 'plans',   label: 'Plans',       icon: Dumbbell      },
  { key: 'log',     label: 'Log workout', icon: ClipboardList },
  { key: 'history', label: 'History',     icon: History       },
]

export default function WorkoutsPage() {
  const queryClient = useQueryClient()

  const [tab,          setTab]          = useState('plans')
  const [selectedId,   setSelectedId]   = useState(null)
  const [activePlanId, setActivePlanId] = useState(null)
  const [dirtyIds,     setDirtyIds]     = useState(new Set())

  const markDirty = (planId) => setDirtyIds(prev => new Set([...prev, planId]))
  const markClean = (planId) => setDirtyIds(prev => { const next = new Set(prev); next.delete(planId); return next })

  const { data: rawPlans = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkoutPlans,
    refetchOnWindowFocus: false,
  })

  const plans = useMemo(() => rawPlans.map(normalizePlan), [rawPlans])

  useEffect(() => {
    if (plans.length > 0 && selectedId === null) setSelectedId(plans[0].id)
  }, [plans, selectedId])


  const createMutation = useMutation({
    mutationFn: (name) => createWorkoutPlan({ name }),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['workouts'], old => [...(old ?? []), newPlan])
      setSelectedId(newPlan.id)
    },
  })

 
  const deletePlanMutation = useMutation({
    mutationFn: (planId) => deleteWorkoutPlan(planId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData(['workouts'], old => (old ?? []).filter(p => p.id !== planId))
      if (selectedId   === planId) setSelectedId(null)
      if (activePlanId === planId) setActivePlanId(null)
    },
  })


  const saveMutation = useMutation({
    onSuccess: (_, plan) => markClean(plan.id),
    mutationFn: async (plan) => {
      const results = await Promise.all([
        updateWorkoutPlan(plan.id, { name: plan.name }),
        ...plan.days.map(day =>
          updateWorkoutDay(plan.id, day.id, { name: day.label })
        ),
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
            queryClient.setQueryData(['workouts'], old =>
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
      queryClient.setQueryData(['workouts'], old =>
        (old ?? []).map(p => p.id === planId ? { ...p, days: [...(p.days ?? []), newDay] } : p)
      )
    },
  })


  const deleteDayMutation = useMutation({
    mutationFn: ({ planId, dayId }) => deleteWorkoutDay(planId, dayId),
    onSuccess: (_, { planId, dayId }) => {
      queryClient.setQueryData(['workouts'], old =>
        (old ?? []).map(p => p.id === planId ? { ...p, days: (p.days ?? []).filter(d => d.id !== dayId) } : p)
      )
    },
  })

  const deleteExerciseMutation = useMutation({
    mutationFn: ({ planId, dayId, exId }) => deleteWorkoutExercise(planId, dayId, exId),
    onSuccess: (_, { planId, dayId, exId }) => {
      queryClient.setQueryData(['workouts'], old =>
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
    queryClient.setQueryData(['workouts'], old =>
      (old ?? []).map(p => p.id === planId ? { ...p, name } : p)
    )
  }

  function handleRenameDay(planId, dayId, name) {
    markDirty(planId)
    queryClient.setQueryData(['workouts'], old =>
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
    queryClient.setQueryData(['workouts'], old =>
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
    queryClient.setQueryData(['workouts'], old =>
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

  function handleFinish() { queryClient.invalidateQueries({ queryKey: ['workout-logs'] }) }

  const selectedPlan = plans.find(p => p.id === selectedId) ?? null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}
      >
        <div className="rounded-2xl border p-5 bg-muted/30">
          <Dumbbell size={32} strokeWidth={1.2} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No workout plans yet</p>
          <p className="text-sm text-muted-foreground mt-1">Build your first plan with custom days and exercises.</p>
        </div>
        <Button onClick={() => createMutation.mutate('New plan')} disabled={createMutation.isPending} className="gap-2">
          <Plus size={15} strokeWidth={2} /> Create a plan
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div className="h-full min-h-0 w-full flex flex-col px-6" variants={stagger} initial="hidden" animate="show">

      <motion.div variants={fadeUp} className="flex items-center gap-1 mb-8 border-b">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            <t.icon size={15} strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {tab === 'plans' && (
          <motion.div key="plans"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={spring} className='flex flex-col h-full min-h-0'
          >
            <div className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
              <aside className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-medium">My plans</h2>
                  <motion.button onClick={() => createMutation.mutate('New plan')} disabled={createMutation.isPending}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                    <Plus size={15} strokeWidth={1.5} />
                  </motion.button>
                </div>

                <div className="divide-y rounded-xl border overflow-hidden">
                  <AnimatePresence>
                    {plans.map(plan => (
                      <motion.div key={plan.id} layout variants={fadeUp} initial="hidden" animate="show" exit="exit"
                        onClick={() => setSelectedId(plan.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors group cursor-pointer',
                          selectedId === plan.id ? 'bg-muted/60' : 'bg-card hover:bg-muted/30'
                        )}>
                        <div>
                          <p className={cn('text-sm', selectedId === plan.id ? 'font-medium' : '')}>{plan.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                            {activePlanId === plan.id && <span className="ml-2 text-foreground font-medium">· active</span>}
                          </p>
                          <p className="text-xs mt-0.5">
                            {plan.createdBy?.type === 'coach'
                              ? <span className="text-blue-500">Assigned by {plan.createdBy.name}</span>
                              : <span className="text-muted-foreground/60">Created by you</span>
                            }
                          </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deletePlanMutation.mutate(plan.id) }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

              </aside>

              <section className='h-full min-h-0'>
                <AnimatePresence mode="wait">
                  {selectedPlan ? (
                    <PlanEditor
                      key={selectedPlan.id}
                      plan={selectedPlan}
                      isActive={activePlanId === selectedPlan.id}
                      onSetActive={() => setActivePlanId(selectedPlan.id)}
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
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-48 rounded-xl border border-dashed text-sm text-muted-foreground">
                      Select a plan to edit
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </motion.div>
        )}

        {tab === 'log' && (
          <motion.div key="log"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={spring} className='h-full min-h-0'
          >
            <WorkoutLogger plans={plans} onFinish={handleFinish} />
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div key="history"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={spring} className='h-full min-h-0'
          >
            <LogHistory />
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
