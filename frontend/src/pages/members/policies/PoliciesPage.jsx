import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchGyms, fetchPolicies, fetchCancellationPolicies } from '@/lib/api'

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

function PolicyItem({ policy }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors"
      >
        <div>
          <p className="text-sm font-medium">{policy.title}</p>
          {policy.category_name && (
            <p className="text-xs text-muted-foreground mt-0.5">{policy.category_name}</p>
          )}
        </div>
        <span className="text-muted-foreground text-xs ml-4 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t">
              {policy.content}
              {policy.penalty_type && policy.penalty_type !== 'none' && (
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <span>Penalty: <strong>{policy.penalty_type}</strong> — {policy.penalty_amount}</span>
                  <span>Notice required: <strong>{policy.notice_hours}h</strong></span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function GymPolicies({ gym }) {
  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ['policies', gym.id],
    queryFn:  () => fetchPolicies(gym.id),
  })

  const { data: cancellationPolicies = [], isLoading: loadingCancellation } = useQuery({
    queryKey: ['cancellationPolicies', gym.id],
    queryFn:  () => fetchCancellationPolicies(gym.id),
  })

  const isLoading = loadingPolicies || loadingCancellation
  const allPolicies = [...policies, ...cancellationPolicies]

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (allPolicies.length === 0) {
    return <p className="text-sm text-muted-foreground">No policies published yet.</p>
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2">
      {allPolicies.map(policy => (
        <PolicyItem key={`${policy.id}-${policy.penalty_type ?? 'p'}`} policy={policy} />
      ))}
    </motion.div>
  )
}

export default function PoliciesPage() {
  const { data: gyms = [], isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn:  fetchGyms,
  })

  return (
    <motion.div
      className="flex flex-col gap-8 px-6 py-2 max-w-2xl"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Gym Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">Rules and policies for your gym.</p>
      </motion.div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && gyms.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <ScrollText size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No policies available.</p>
        </motion.div>
      )}

      {!isLoading && gyms.map(gym => (
        <motion.div key={gym.id} variants={fadeUp} className="flex flex-col gap-4">
          {gyms.length > 1 && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{gym.name}</h2>
          )}
          <GymPolicies gym={gym} />
        </motion.div>
      ))}
    </motion.div>
  )
}
