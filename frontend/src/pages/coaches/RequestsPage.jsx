import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Check, X, Calendar, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchCoachRequests, respondToRequest } from '@/lib/api'
import { fadeUp, stagger, spring } from './animations'

function formatSlot(slot) {
  if (!slot) return slot
  const d = new Date(slot)
  if (isNaN(d)) return slot
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function RequestCard({ session }) {
  const queryClient                   = useQueryClient()
  const [rejecting,  setRejecting]    = useState(false)
  const [reason,     setReason]       = useState('')

  const mutation = useMutation({
    mutationFn: (payload) => respondToRequest(session.id, payload),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['coachRequests'] }),
  })

  function handleAccept() {
    mutation.mutate({ action: 'accept' })
  }

  function handleRejectSubmit() {
    if (!reason.trim()) return
    mutation.mutate({ action: 'reject', rejection_reason: reason.trim() })
  }

  const pending = mutation.isPending

  return (
    <motion.div variants={fadeUp} className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{session.member_name}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatSlot(session.scheduled_slot)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {session.duration} min
            </span>
          </div>
          {session.goals && (
            <p className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
              <Target size={13} className="mt-0.5 shrink-0" />
              {session.goals}
            </p>
          )}
        </div>
      </div>

      {/* Rejection textarea */}
      <AnimatePresence>
        {rejecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <textarea
              placeholder="Explain why you're declining this request…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2">
        {!rejecting ? (
          <>
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={pending}
              className="gap-1.5"
            >
              <Check size={13} strokeWidth={2.5} />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRejecting(true)}
              disabled={pending}
              className="gap-1.5"
            >
              <X size={13} strokeWidth={2.5} />
              Decline
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={pending || !reason.trim()}
              className="gap-1.5"
            >
              <X size={13} strokeWidth={2.5} />
              {pending ? 'Declining…' : 'Confirm decline'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setRejecting(false); setReason('') }}
              disabled={pending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      {mutation.isError && (
        <p className="text-xs text-destructive">
          {mutation.error?.response?.data?.error ?? 'Something went wrong.'}
        </p>
      )}
    </motion.div>
  )
}

export default function RequestsPage() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['coachRequests'],
    queryFn:  fetchCoachRequests,
  })

  return (
    <motion.div className="flex flex-col gap-8 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Session Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and respond to booking requests from members.</p>
      </motion.div>

      {isLoading ? (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-muted/30 h-32 animate-pulse" />
          ))}
        </motion.div>
      ) : requests.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Inbox size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No pending requests</p>
            <p className="text-sm text-muted-foreground mt-1">New session requests from members will show up here.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger()} className="flex flex-col gap-3">
          {requests.map(session => (
            <RequestCard key={session.id} session={session} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}