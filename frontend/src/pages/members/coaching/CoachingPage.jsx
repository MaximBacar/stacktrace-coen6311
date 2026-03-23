import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { stagger } from './components/animations'
import { fetchCoaches, fetchMemberSessions, bookCoachingSession } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import UpcomingSessions from './components/UpcomingSessions'
import CoachSearch from './components/CoachSearch'
import BookingSheet from './components/BookingSheet'
import ChatPanel from '@/components/chat/ChatPanel'

function parseSlot(scheduled_slot) {
  const parts = scheduled_slot?.split(' ', 2) ?? []
  return { day: parts[0] ?? '', time: parts[1] ?? scheduled_slot ?? '' }
}

export default function CoachingPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const memberId = user?.id

  const [query,        setQuery]        = useState('')
  const [bookingCoach, setBookingCoach] = useState(null)
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)

  const { data: coaches = [] } = useQuery({
    queryKey: ['coaches'],
    queryFn: () => fetchCoaches().then(r => r.data),
    refetchOnWindowFocus: false,
  })

  const { data: rawSessions = [] } = useQuery({
    queryKey: ['member-sessions', memberId],
    queryFn: () => fetchMemberSessions(memberId).then(r => r.data),
    enabled: Boolean(memberId),
    refetchOnWindowFocus: false,
  })

  const sessions = useMemo(() =>
    rawSessions
      .filter(s => s.status === 'booked' || s.status === 'accepted')
      .map(s => {
        const { day, time } = parseSlot(s.scheduled_slot)
        return {
          id:        s.id,
          coachName: s.coach_name,
          specialty: s.coach_specialty,
          avatar:    s.coach_avatar_url,
          day,
          time,
          duration:  s.duration,
        }
      }),
  [rawSessions])

  const bookMutation = useMutation({
    mutationFn: bookCoachingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] })
      queryClient.invalidateQueries({ queryKey: ['member-sessions', memberId] })
    },
  })

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return coaches
    return coaches.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q) ||
      (c.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
  }, [coaches, query])

  function openBooking(coach) { setBookingCoach(coach); setSheetOpen(true) }

return (
    <>
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 px-6 overflow-hidden">
        <motion.div
          className="flex flex-col gap-10 overflow-y-auto"
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
        >
          <UpcomingSessions sessions={sessions} />
          <CoachSearch
            query={query}
            onQueryChange={setQuery}
            filtered={filtered}
            onBook={openBooking}
          />
        </motion.div>

        <div className="h-full min-h-0 py-1">
          <ChatPanel activeChatId={activeChatId} onChatChange={setActiveChatId} />
        </div>
      </div>

      <BookingSheet
        coach={bookingCoach}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        memberId={memberId}
        bookMutation={bookMutation}
      />
    </>
  )
}