import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { spring, fadeUp } from './animations'
import CoachRow from './CoachRow'

export default function CoachSearch({ query, onQueryChange, filtered, onBook }) {
  return (
    <motion.section variants={fadeUp} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Find a coach</h2>
        <motion.span
          key={filtered.length}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="text-xs text-muted-foreground"
        >
          {filtered.length} available
        </motion.span>
      </div>

      <div className="relative">
        <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, specialty, or skill…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border overflow-hidden divide-y">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-10 text-center text-sm text-muted-foreground"
            >
              No coaches match "{query}"
            </motion.div>
          ) : (
            filtered.map(coach => (
              <div key={coach.id} className="px-4">
                <CoachRow coach={coach} onBook={onBook} />
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}