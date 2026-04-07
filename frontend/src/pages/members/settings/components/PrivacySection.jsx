import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Clock, Check, X } from 'lucide-react'
import { fetchAccessRequests, respondAccessRequest, revokeAccessRequest } from '@/lib/api'
import Section from './Section'

const STATUS_BADGE = {
  pending:  { label: 'Pending',  icon: Clock,        cls: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  accepted: { label: 'Accepted', icon: Check,        cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  declined: { label: 'Declined', icon: X,            cls: 'text-muted-foreground bg-muted/40 border-border' },
}

export default function PrivacySection() {
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['accessRequests'],
    queryFn:  fetchAccessRequests,
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, action }) => respondAccessRequest(id, action),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['accessRequests'] }),
  })

  const revokeMutation = useMutation({
    mutationFn: (id) => revokeAccessRequest(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['accessRequests'] }),
  })

  const visible = requests.filter(r => r.status !== 'declined')

  return (
    <Section
      title="Profile privacy"
      description="Coaches who have requested access to your fitness profile. Accept to let them view your data."
    >
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
          <ShieldCheck size={16} strokeWidth={1.5} />
          No coaches have requested access to your profile.
        </div>
      )}

      {!isLoading && visible.length > 0 && (
        <div className="flex flex-col gap-2">
          {visible.map(req => {
            const badge  = STATUS_BADGE[req.status]
            const BadgeIcon = badge.icon
            const pending = respondMutation.isPending || revokeMutation.isPending

            return (
              <div key={req.id} className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {req.coach_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{req.coach_name}</p>
                    {req.specialty && <p className="text-xs text-muted-foreground truncate">{req.specialty}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status badge */}
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                    <BadgeIcon size={10} strokeWidth={2.5} />
                    {badge.label}
                  </span>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => respondMutation.mutate({ id: req.id, action: 'accept' })}
                        disabled={pending}
                        className="text-xs px-2.5 py-1 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: req.id, action: 'decline' })}
                        disabled={pending}
                        className="text-xs px-2.5 py-1 rounded-lg border hover:bg-muted/40 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => revokeMutation.mutate(req.id)}
                      disabled={pending}
                      className="text-xs px-2.5 py-1 rounded-lg border text-destructive border-destructive/40 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}
