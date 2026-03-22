import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { spring, fadeUp, stagger } from './animations'
import { DURATIONS } from './data'

export default function BookingSheet({ coach, open, onOpenChange, onBook }) {
  const days = coach ? Object.keys(coach.slots) : []
  const [selectedDay,      setSelectedDay]      = useState(null)
  const [selectedTime,     setSelectedTime]     = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [booked,           setBooked]           = useState(false)

  function reset() { setSelectedDay(null); setSelectedTime(null); setSelectedDuration(60); setBooked(false) }
  function handleOpenChange(val) { if (!val) reset(); onOpenChange(val) }
  function handleBook() {
    if (!selectedDay || !selectedTime) return
    onBook({ coach, day: selectedDay, time: selectedTime, duration: selectedDuration })
    setBooked(true)
  }

  if (!coach) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-6 pt-8">
        <SheetHeader className="gap-4">
          <div className="flex items-center gap-4">
            <img src={coach.avatar} alt={coach.name} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <SheetTitle className="text-base">{coach.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{coach.specialty}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="fill-foreground text-foreground" />
                <span className="text-xs font-medium">{coach.rating}</span>
                <span className="text-xs text-muted-foreground">· {coach.sessions} sessions</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{coach.bio}</p>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {booked ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="flex flex-col items-center justify-center gap-4 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                className="rounded-full border p-4"
              >
                <Check size={28} strokeWidth={1.5} />
              </motion.div>
              <div>
                <p className="font-medium">Session booked</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDay} at {selectedTime} · {selectedDuration} min with {coach.name}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>Close</Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={stagger(0.07)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-5"
            >
              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</p>
                <div className="flex gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setSelectedDuration(d)}
                      className={cn('flex-1 py-2 rounded-lg border text-sm transition-colors',
                        selectedDuration === d ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}>{d} min</button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Day</p>
                <div className="flex gap-2 flex-wrap">
                  {days.map(day => (
                    <button key={day} onClick={() => { setSelectedDay(day); setSelectedTime(null) }}
                      className={cn('px-4 py-2 rounded-lg border text-sm transition-colors',
                        selectedDay === day ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}>{day}</button>
                  ))}
                </div>
              </motion.div>

              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    key={selectedDay}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="flex flex-col gap-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</p>
                    <div className="grid grid-cols-3 gap-2">
                      {coach.slots[selectedDay].map(slot => (
                        <button key={slot} onClick={() => setSelectedTime(slot)}
                          className={cn('py-2 rounded-lg border text-sm transition-colors',
                            selectedTime === slot ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                          )}>{slot}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={fadeUp} className="mt-auto pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">${coach.price}</p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
                <Button onClick={handleBook} disabled={!selectedDay || !selectedTime} className="gap-2">
                  Confirm booking
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}