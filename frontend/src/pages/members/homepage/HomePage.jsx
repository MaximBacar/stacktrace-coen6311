import { Dumbbell, Brain, Salad, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Workouts this week', value: '4',     sub: '2 remaining',    icon: Dumbbell },
  { label: 'Calories today',     value: '1,840', sub: 'Goal: 2,200',    icon: Flame    },
  { label: 'Coach sessions',     value: '1',     sub: 'Next: Thursday', icon: Brain    },
  { label: 'Protein today',      value: '112g',  sub: 'Goal: 150g',     icon: Salad    },
]

const recentWorkouts = [
  { name: 'Upper body — Push',  date: 'Mon 3 Mar', duration: '48 min', sets: 18 },
  { name: 'Lower body — Squat', date: 'Wed 5 Mar', duration: '55 min', sets: 22 },
  { name: 'Pull day',           date: 'Fri 7 Mar', duration: '42 min', sets: 16 },
]

const spring = { type: 'spring', stiffness: 100, damping: 20 }

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: spring },
}

const stagger = (delay = 0.05) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
})

export default function HomePage() {
  return (
    <motion.div
      className="w-full h-full min-h-0 px-6 overflow-y-scroll space-y-10"
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <p className="text-sm text-muted-foreground mb-1">Saturday, 7 March</p>
        <h1 className="text-3xl font-semibold tracking-tight">Good morning</h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger(0.06)}
      >
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
        <motion.div
          className="divide-y rounded-xl border overflow-hidden"
          variants={stagger(0.07)}
        >
          {recentWorkouts.map((w) => (
            <motion.div
              key={w.name}
              variants={fadeUp}
              className="flex items-center justify-between px-5 py-4 bg-card"
            >
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm tabular-nums">{w.duration}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.sets} sets</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium tracking-tight">Weekly goal</h2>
          <span className="text-xs text-muted-foreground">4 / 6 workouts</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-foreground"
            initial={{ width: '0%' }}
            animate={{ width: '67%' }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
