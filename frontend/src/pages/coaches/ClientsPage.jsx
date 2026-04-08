import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, MessageCircle, ChevronRight, Dumbbell, Utensils, User, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger, spring } from './animations'
import ChatPanel from '@/components/chat/ChatPanel'
import { fetchAssignedClients, fetchClientDetail, getOrCreateChat, requestProfileAccess } from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  light:     'Lightly active',
  moderate:  'Moderately active',
  very:      'Very active',
  extreme:   'Extremely active',
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="rounded-2xl border p-4 bg-muted/30">
        <Icon size={22} strokeWidth={1.2} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function ProfileTab({ profile }) {
  if (!profile) return <EmptyState icon={User} text="No fitness profile yet." />

  const rows = [
    ['Height',         profile.height_cm ? `${profile.height_cm} cm` : '—'],
    ['Weight',         profile.weight_kg ? `${profile.weight_kg} kg` : '—'],
    ['Activity level', ACTIVITY_LABELS[profile.activity_level] ?? '—'],
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border divide-y">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      {profile.dietary_restrictions?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Dietary restrictions</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.dietary_restrictions.map(r => (
              <span key={r} className="text-xs px-2.5 py-1 rounded-full border bg-muted/40">{r.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {profile.fitness_goals?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Fitness goals</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.fitness_goals.map(g => (
              <span key={g} className="text-xs px-2.5 py-1 rounded-full border bg-muted/40">{g.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProgramsTab({ plans }) {
  const [open, setOpen] = useState(null)

  if (!plans?.length) return <EmptyState icon={Dumbbell} text="No workout programs yet." />

  return (
    <div className="flex flex-col gap-2">
      {plans.map(plan => (
        <div key={plan.id} className="rounded-xl border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setOpen(open === plan.id ? null : plan.id)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{plan.name}</p>
                {plan.source_plan_id != null && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20 shrink-0">
                    Assigned by you
                  </span>
                )}
              </div>
              {plan.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{plan.description}</p>}
            </div>
            <ChevronRight
              size={14}
              className={cn('text-muted-foreground transition-transform shrink-0 ml-2', open === plan.id && 'rotate-90')}
            />
          </button>

          <AnimatePresence>
            {open === plan.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring}
                className="overflow-hidden border-t"
              >
                <div className="px-4 py-3 flex flex-col gap-3">
                  {plan.days?.map(day => (
                    <div key={day.id}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{day.name}</p>
                      <div className="flex flex-col gap-1">
                        {day.exercises?.map(ex => (
                          <div key={ex.id} className="text-xs flex items-center justify-between py-0.5">
                            <span>{ex.name}</span>
                            <span className="text-muted-foreground">
                              {ex.sets} × {ex.reps ? `${ex.reps} reps` : `${ex.duration}s`}
                            </span>
                          </div>
                        ))}
                        {!day.exercises?.length && <p className="text-xs text-muted-foreground">No exercises.</p>}
                      </div>
                    </div>
                  ))}
                  {!plan.days?.length && <p className="text-xs text-muted-foreground">No days added.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function WorkoutLogsTab({ logs }) {
  if (!logs?.length) return <EmptyState icon={Activity} text="No workout sessions logged yet." />

  return (
    <div className="flex flex-col gap-2">
      {logs.map(log => (
        <div key={log.id} className="rounded-xl border px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">{log.plan_name}</p>
              <p className="text-xs text-muted-foreground">{log.day_name}</p>
            </div>
            <span className="text-xs text-muted-foreground">{fmt(log.created_at)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {log.sets?.map(s => (
              <div key={s.id} className="text-xs flex items-center justify-between text-muted-foreground">
                <span>{s.exercise_name}</span>
                <span>{s.weight} kg × {s.reps ? `${s.reps} reps` : `${s.duration}s`}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function NutritionTab({ plans, logs }) {
  const [view, setView] = useState('logs')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-lg border overflow-hidden self-start">
        {['logs', 'plans'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-3 py-1.5 text-xs transition-colors capitalize',
              view === v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'logs' && (
        logs?.length ? (
          <div className="flex flex-col gap-1.5">
            {logs.map(l => (
              <div key={l.id} className="flex items-center justify-between text-sm px-4 py-2.5 rounded-xl border">
                <div>
                  <span className="font-medium">{l.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{l.meal}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{l.calories} kcal</span>
                  <span>{fmt(l.logged_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Utensils} text="No nutrition logs yet." />
      )}

      {view === 'plans' && (
        plans?.length ? (
          <div className="flex flex-col gap-2">
            {plans.map(plan => (
              <div key={plan.id} className="rounded-xl border px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{plan.name}</p>
                    {plan.source_plan_id != null && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Assigned by you</span>
                    )}
                  </div>
                  {plan.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>}
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{plan.target_calories} kcal</span>
                  <span>P {plan.target_protein}g</span>
                  <span>C {plan.target_carbs}g</span>
                  <span>F {plan.target_fat}g</span>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Utensils} text="No nutrition plans yet." />
      )}
    </div>
  )
}

const TABS = [
  { key: 'profile',   label: 'Profile',   icon: User },
  { key: 'programs',  label: 'Programs',  icon: Dumbbell },
  { key: 'workouts',  label: 'Workouts',  icon: Activity },
  { key: 'nutrition', label: 'Nutrition', icon: Utensils },
]

function AccessGate({ client, access, accessRequestId, onRequestSent }) {
  const queryClient = useQueryClient()

  const requestMutation = useMutation({
    mutationFn: () => requestProfileAccess(client.id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['clientDetail', client.id] }),
  })

  const messages = {
    none:     { text: 'You don\'t have access to this member\'s fitness profile.', cta: 'Request access' },
    declined: { text: 'Your previous request was declined.', cta: 'Request access again' },
    pending:  { text: 'Your access request is pending approval from the member.', cta: null },
  }
  const msg = messages[access] ?? messages.none

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-2xl border p-4 bg-muted/30">
        <User size={22} strokeWidth={1.2} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-sm">Profile not accessible</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-56">{msg.text}</p>
      </div>
      {msg.cta && (
        <button
          onClick={() => requestMutation.mutate()}
          disabled={requestMutation.isPending}
          className="text-xs px-4 py-2 rounded-lg border bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {requestMutation.isPending ? 'Sending…' : msg.cta}
        </button>
      )}
      {requestMutation.isSuccess && (
        <p className="text-xs text-muted-foreground">Request sent — waiting for approval.</p>
      )}
    </div>
  )
}

function ClientDetail({ client, onMessage }) {
  const [tab, setTab] = useState('profile')

  const { data, isLoading } = useQuery({
    queryKey: ['clientDetail', client.id],
    queryFn:  () => fetchClientDetail(client.id),
  })

  const access = data?.access ?? (isLoading ? null : 'none')

  return (
    <motion.div
      key={client.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={spring}
      className="h-full flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
            {client.first_name?.[0]}{client.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{client.full_name}</p>
            <p className="text-xs text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <button
          onClick={onMessage}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors shrink-0"
        >
          <MessageCircle size={12} strokeWidth={1.5} />
          Message
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl border bg-muted/30 animate-pulse" />)}
        </div>
      )}

      {!isLoading && access !== 'accepted' && (
        <AccessGate client={client} access={access} accessRequestId={data?.access_request_id} />
      )}

      {!isLoading && access === 'accepted' && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 shrink-0 flex-wrap">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                    tab === t.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon size={12} />
                  {t.label}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {tab === 'profile'   && <ProfileTab    profile={data?.fitness_profile} />}
            {tab === 'programs'  && <ProgramsTab   plans={data?.workout_plans} />}
            {tab === 'workouts'  && <WorkoutLogsTab logs={data?.workout_logs} />}
            {tab === 'nutrition' && <NutritionTab  plans={data?.nutrition_plans} logs={data?.nutrition_logs} />}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState(null)
  const [activeChatId,   setActiveChatId]   = useState(null)
  const [rightPanel,     setRightPanel]     = useState('detail') // 'detail' | 'chat'

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['assignedClients'],
    queryFn:  fetchAssignedClients,
  })

  const openChatMutation = useMutation({
    mutationFn: (memberId) => getOrCreateChat(memberId),
    onSuccess:  (chat) => {
      setActiveChatId(chat.id)
      setRightPanel('chat')
    },
  })

  function handleSelectClient(client) {
    setSelectedClient(client)
    setRightPanel('detail')
  }

  function handleMessage(client) {
    setSelectedClient(client)
    openChatMutation.mutate(client.id)
  }

  const hasRight = selectedClient || activeChatId

  return (
    <motion.div
      className={cn(
        'w-full h-full min-h-0 grid gap-6 px-6 overflow-hidden',
        hasRight ? 'grid-cols-[260px_1fr]' : 'grid-cols-1'
      )}
      variants={stagger()}
      initial="hidden"
      animate="show"
    >
      {/* Left — client list */}
      <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Members you are currently working with.</p>
        </motion.div>

        {isLoading && (
          <motion.div variants={fadeUp} className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl border bg-muted/30 animate-pulse" />
            ))}
          </motion.div>
        )}

        {!isLoading && clients.length === 0 && (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
            <div className="rounded-2xl border p-5 bg-muted/30">
              <Users size={28} strokeWidth={1.2} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-1">Accepted session requests will appear here.</p>
            </div>
          </motion.div>
        )}

        {!isLoading && clients.length > 0 && (
          <motion.div variants={stagger(0.05)} className="flex flex-col gap-2">
            {clients.map(client => (
              <motion.button
                key={client.id}
                variants={fadeUp}
                onClick={() => handleSelectClient(client)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                  selectedClient?.id === client.id ? 'bg-foreground text-background' : 'bg-card hover:bg-muted/40'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                  selectedClient?.id === client.id ? 'bg-background/20 text-background' : 'bg-muted'
                )}>
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-xs font-medium truncate', selectedClient?.id === client.id ? 'text-background' : '')}>
                    {client.full_name}
                  </p>
                  <p className={cn('text-xs truncate', selectedClient?.id === client.id ? 'text-background/60' : 'text-muted-foreground')}>
                    {client.email}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right — detail or chat */}
      {hasRight && (
        <motion.div variants={fadeUp} className="h-full min-h-0 py-1 overflow-hidden flex flex-col">
          {/* Toggle when both are available */}
          {selectedClient && activeChatId && (
            <div className="flex gap-1 mb-4 shrink-0">
              {['detail', 'chat'].map(p => (
                <button
                  key={p}
                  onClick={() => setRightPanel(p)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg transition-colors capitalize',
                    rightPanel === p ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {p === 'detail' ? 'Profile' : 'Chat'}
                </button>
              ))}
            </div>
          )}

          {rightPanel === 'detail' && selectedClient && (
            <ClientDetail
              client={selectedClient}
              onMessage={() => handleMessage(selectedClient)}
            />
          )}

          {rightPanel === 'chat' && (
            <ChatPanel activeChatId={activeChatId} onChatChange={setActiveChatId} />
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
