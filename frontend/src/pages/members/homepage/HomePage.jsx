import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dumbbell, Brain, Salad, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchWorkoutLogs,
  fetchMealLogs,
  fetchNutritionPlan,
  fetchMemberSessions,
} from '@/lib/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

function weekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  return new Date(new Date().setDate(diff))
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------
const spring  = { type: 'spring', stiffness: 100, damping: 20 }
const fadeUp  = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: spring } }
const stagger = (delay = 0.05) => ({ hidden: {}, show: { transition: { staggerChildren: delay } } })

const WEEKLY_TARGET = 5

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomePage() {
  const { user } = useAuth()

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['workout-logs'],
    queryFn:  fetchWorkoutLogs,
  })

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn:  fetchMealLogs,
  })

  const { data: planData = {} } = useQuery({
    queryKey: ['nutritionPlan'],
    queryFn:  fetchNutritionPlan,
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['member-sessions', user?.id],
    queryFn:  () => fetchMemberSessions(user.id).then(r => r.data),
    enabled:  !!user?.id,
  })

  // Workouts logged this calendar week (Mon → today)
  const mon = useMemo(() => weekStart(), [])
  const workoutsThisWeek = useMemo(
    () => workoutLogs.filter(l => new Date(l.created_at) >= mon),
    [workoutLogs, mon],
  )

  // Nutrition totals from today's meal logs
  const caloriesToday = useMemo(
    () => mealLogs.reduce((s, l) => s + (l.calories ?? 0), 0),
    [mealLogs],
  )
  const proteinToday = useMemo(
    () => mealLogs.reduce((s, l) => s + Number(l.protein ?? 0), 0),
    [mealLogs],
  )
  const goals = planData.targets ?? { calories: 0, protein: 0 }

  // Upcoming accepted sessions sorted by date
  const upcomingSessions = useMemo(
    () => sessions
      .filter(s => s.status === 'accepted' && new Date(s.scheduled_slot) > new Date())
      .sort((a, b) => new Date(a.scheduled_slot) - new Date(b.scheduled_slot)),
    [sessions],
  )
  const nextSession = upcomingSessions[0]
  const nextSessionDay = nextSession
    ? new Date(nextSession.scheduled_slot).toLocaleDateString('en-US', { weekday: 'long' })
    : null

  const stats = [
    {
      label: 'Workouts this week',
      value: String(workoutsThisWeek.length),
      sub:   `${Math.max(0, WEEKLY_TARGET - workoutsThisWeek.length)} remaining`,
      icon:  Dumbbell,
    },
    {
      label: 'Calories today',
      value: caloriesToday.toLocaleString(),
      sub:   goals.calories ? `Goal: ${Number(goals.calories).toLocaleString()}` : 'No goal set',
      icon:  Flame,
    },
    {
      label: 'Coach sessions',
      value: String(upcomingSessions.length),
      sub:   nextSessionDay ? `Next: ${nextSessionDay}` : 'None upcoming',
      icon:  Brain,
    },
    {
      label: 'Protein today',
      value: `${Math.round(proteinToday)}g`,
      sub:   goals.protein ? `Goal: ${goals.protein}g` : 'No goal set',
      icon:  Salad,
    },
  ]

  // Recent workouts — last 3 logs sorted newest first
  const recentWorkouts = useMemo(
    () => [...workoutLogs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3),
    [workoutLogs],
  )

  const weeklyProgress = Math.min(workoutsThisWeek.length / WEEKLY_TARGET, 1)
  const firstName = user?.full_name?.split(' ')[0]

  return (
    <motion.div
      className="w-full h-full min-h-0 px-6 overflow-y-scroll space-y-10"
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp}>
        <p className="text-sm text-muted-foreground mb-1">{formatDate()}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
      </motion.div>

      {/* Stats grid */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger(0.06)}>
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="rounded-xl border bg-card p-5 flex flex-col gap-3"
          >
            <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
            <div>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent workouts */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-tight">Recent workouts</h2>
          <a href="/workouts" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </a>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="rounded-xl border border-dashed flex items-center justify-center h-24 text-sm text-muted-foreground">
            No workouts logged yet
          </div>
        ) : (
          <motion.div className="divide-y rounded-xl border overflow-hidden" variants={stagger(0.07)}>
            {recentWorkouts.map(w => (
              <motion.div
                key={w.id}
                variants={fadeUp}
                className="flex items-center justify-between px-5 py-4 bg-card"
              >
                <div>
                  <p className="text-sm font-medium">{w.plan_name} — {w.day_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(w.created_at).toLocaleDateString('en-US', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums text-muted-foreground">{w.sets.length} sets</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Weekly goal progress */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium tracking-tight">Weekly goal</h2>
          <span className="text-xs text-muted-foreground">
            {workoutsThisWeek.length} / {WEEKLY_TARGET} workouts
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-foreground"
            initial={{ width: '0%' }}
            animate={{ width: `${weeklyProgress * 100}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
