import { useState } from 'react'
import { Plus, Trash2, Dumbbell, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from './components/animations'
import { PPL_PLAN, makePlan } from './components/helpers'
import PlanEditor from './components/PlanEditor'
import WorkoutLogger from './components/WorkoutLogger'

const TABS = [
  { key: 'plans', label: 'Plans',       icon: Dumbbell      },
  { key: 'log',   label: 'Log workout', icon: ClipboardList },
]

export default function WorkoutsPage() {
  const [tab,          setTab]          = useState('plans')
  const [plans,        setPlans]        = useState([PPL_PLAN])
  const [selectedId,   setSelectedId]   = useState(PPL_PLAN.id)
  const [activePlanId, setActivePlanId] = useState(PPL_PLAN.id)
  const [history,      setHistory]      = useState([])

  const selectedPlan = plans.find(p => p.id === selectedId) ?? null

  function createPlan() {
    const plan = makePlan()
    setPlans(prev => [...prev, plan])
    setSelectedId(plan.id)
  }
  function updatePlan(updated) { setPlans(prev => prev.map(p => p.id === updated.id ? updated : p)) }
  function deletePlan(id) {
    setPlans(prev => prev.filter(p => p.id !== id))
    if (selectedId   === id) setSelectedId(null)
    if (activePlanId === id) setActivePlanId(null)
  }
  function handleFinish(session) {
    setHistory(prev => [session, ...prev])
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
        <Button onClick={createPlan} className="gap-2">
          <Plus size={15} strokeWidth={2} /> Create a plan
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div className="h-full min-h-0 w-full flex flex-col px-6" variants={stagger} initial="hidden" animate="show">

      <motion.div variants={fadeUp} className="flex items-center gap-1 mb-8 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon size={15} strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {tab === 'plans' && (
          <motion.div key="plans"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={spring}
            className='flex flex-col h-full min-h-0'
          >
            <div className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
              <aside className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-medium">My plans</h2>
                  <motion.button onClick={createPlan} whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Plus size={15} strokeWidth={1.5} />
                  </motion.button>
                </div>

                <div className="divide-y rounded-xl border overflow-hidden">
                  <AnimatePresence>
                    {plans.map(plan => (
                      <motion.button key={plan.id} layout variants={fadeUp} initial="hidden" animate="show" exit="exit"
                        onClick={() => setSelectedId(plan.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors group',
                          selectedId === plan.id ? 'bg-muted/60' : 'bg-card hover:bg-muted/30'
                        )}>
                        <div>
                          <p className={cn('text-sm', selectedId === plan.id ? 'font-medium' : '')}>{plan.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                            {activePlanId === plan.id && <span className="ml-2 text-foreground font-medium">· active</span>}
                          </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deletePlan(plan.id) }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                {history.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent</p>
                    <div className="divide-y rounded-xl border overflow-hidden">
                      {history.slice(0, 4).map(s => (
                        <div key={s.id} className="px-4 py-3 bg-card">
                          <p className="text-xs font-medium">{s.planName} — {s.dayLabel}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.exercises.reduce((a, ex) => a + ex.sets.length, 0)} sets ·{' '}
                            {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              <section className='h-full min-h-0'>
                <AnimatePresence mode="wait">
                  {selectedPlan ? (
                    <PlanEditor key={selectedPlan.id} plan={selectedPlan} onUpdate={updatePlan}
                      isActive={activePlanId === selectedPlan.id}
                      onSetActive={() => setActivePlanId(selectedPlan.id)} />
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
            transition={spring}
            className='h-full min-h-0'
          >
            <WorkoutLogger plans={plans} onFinish={handleFinish} />
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
