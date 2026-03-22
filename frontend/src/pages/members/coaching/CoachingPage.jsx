import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { stagger } from './components/animations'
import { COACHES, INITIAL_SESSIONS } from './components/data'
import UpcomingSessions from './components/UpcomingSessions'
import CoachSearch from './components/CoachSearch'
import BookingSheet from './components/BookingSheet'

export default function CoachingPage() {
  const [query,        setQuery]        = useState('')
  const [sessions,     setSessions]     = useState(INITIAL_SESSIONS)
  const [bookingCoach, setBookingCoach] = useState(null)
  const [sheetOpen,    setSheetOpen]    = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return COACHES
    return COACHES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [query])

  function openBooking(coach) { setBookingCoach(coach); setSheetOpen(true) }

  function handleBook({ coach, day, time, duration }) {
    setSessions(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      coachId: coach.id,
      coachName: coach.name,
      specialty: coach.specialty,
      day, time, duration,
      avatar: coach.avatar,
    }])
  }

  return (
    <>
      <motion.div
        className="w-full flex flex-col gap-10 overflow-y-scroll px-6"
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

      <BookingSheet
        coach={bookingCoach}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onBook={handleBook}
      />
    </>
  )
}