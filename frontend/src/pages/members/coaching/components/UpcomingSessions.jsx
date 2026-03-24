import { CalendarDays, Clock, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { spring, fadeUp } from './animations'

function SessionCard({ s, variant = 'default' }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={spring}
      className="shrink-0 w-64 rounded-xl border bg-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <img src={s.avatar} alt={s.coachName} className="w-9 h-9 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium leading-tight">{s.coachName}</p>
          <p className="text-xs text-muted-foreground">{s.specialty}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
        <span className="flex items-center gap-1">
          <CalendarDays size={12} strokeWidth={1.5} />
          {s.day}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} strokeWidth={1.5} />
          {s.time} · {s.duration} min
        </span>
      </div>

      {variant === 'pending' && (
        <p className="text-xs text-amber-500 font-medium -mt-1">Awaiting approval</p>
      )}

      {variant === 'rejected' && s.rejectionReason && (
        <div className="flex items-start gap-1.5 -mt-1">
          <XCircle size={12} strokeWidth={1.5} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive leading-snug">{s.rejectionReason}</p>
        </div>
      )}
    </motion.div>
  )
}

function SessionList({ sessions, variant, emptyText }) {
  return sessions.length === 0 ? (
    <div className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
      {emptyText}
    </div>
  ) : (
    <div className="flex gap-3 overflow-x-auto pb-1">
      <AnimatePresence>
        {sessions.map(s => (
          <SessionCard key={s.id} s={s} variant={variant} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function UpcomingSessions({ upcoming, pending, rejected }) {
  return (
    <motion.section variants={fadeUp} className='px-6 min-h-45'>
      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Sessions</h2>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcoming.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted-foreground/20 rounded-full px-1.5 py-0.5 leading-none">
                  {upcoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pending.length > 0 && (
                <span className="ml-1.5 text-xs bg-amber-500/20 text-amber-600 rounded-full px-1.5 py-0.5 leading-none">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              {rejected.length > 0 && (
                <span className="ml-1.5 text-xs bg-destructive/15 text-destructive rounded-full px-1.5 py-0.5 leading-none">
                  {rejected.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming">
          <SessionList sessions={upcoming} variant="default" emptyText="No confirmed sessions yet" />
        </TabsContent>
        <TabsContent value="pending">
          <SessionList sessions={pending} variant="pending" emptyText="No pending requests" />
        </TabsContent>
        <TabsContent value="rejected">
          <SessionList sessions={rejected} variant="rejected" emptyText="No rejected sessions" />
        </TabsContent>
      </Tabs>
    </motion.section>
  )
}
