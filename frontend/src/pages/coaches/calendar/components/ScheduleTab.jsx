import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { fetchCoachSessions, fetchGymEquipment, fetchGyms, reserveSessionEquipment } from '@/lib/api'
import { fadeUp } from '../../animations'
import WeekGrid from './WeekGrid'
import { slotKey } from './constants'

function SessionReservationCard({ session, options, onReserved }) {
  const [equipmentId, setEquipmentId] = useState(options[0]?.id ? String(options[0].id) : '')
  const [quantity, setQuantity] = useState(1)
  const mutation = useMutation({
    mutationFn: (payload) => reserveSessionEquipment(session.id, payload),
    onSuccess: () => onReserved(),
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!equipmentId) {
      return
    }

    mutation.mutate({ equipment: Number(equipmentId), quantity })
  }

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{session.member_name}</p>
        <p className="text-xs text-muted-foreground mt-1">{session.scheduled_slot}</p>
      </div>

      {session.equipment_reservations?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {session.equipment_reservations.map((reservation) => (
            <span key={reservation.id} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {reservation.equipment_name} x{reservation.quantity}
            </span>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <select
          value={equipmentId}
          onChange={(event) => setEquipmentId(event.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {options.length === 0 && <option value="">No equipment available</option>}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.gym_name} - {option.name} ({option.available_units} open)
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="h-9 w-24 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={options.length === 0 || mutation.isPending}
            className="rounded-lg bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
          >
            {mutation.isPending ? 'Reserving...' : 'Reserve equipment'}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-xs text-destructive">
            {mutation.error?.response?.data?.quantity?.[0]
              ?? mutation.error?.response?.data?.equipment?.[0]
              ?? mutation.error?.response?.data?.error
              ?? 'Reservation failed.'}
          </p>
        )}
      </form>
    </div>
  )
}

export default function ScheduleTab() {
  const queryClient = useQueryClient()
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['coach-sessions'],
    queryFn: fetchCoachSessions,
    refetchOnWindowFocus: false,
  })
  const { data: gyms = [] } = useQuery({
    queryKey: ['gyms'],
    queryFn: fetchGyms,
    refetchOnWindowFocus: false,
  })
  const { data: allEquipment = [] } = useQuery({
    queryKey: ['coach-reservable-equipment', gyms.map((gym) => gym.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(gyms.map((gym) => fetchGymEquipment(gym.id)))
      return results.flat()
    },
    enabled: gyms.length > 0,
    refetchOnWindowFocus: false,
  })

  const reservableEquipment = useMemo(
    () => allEquipment.filter((item) => !['unavailable', 'maintenance'].includes(item.availability_status)),
    [allEquipment],
  )
  const actionableSessions = sessions.filter((session) => session.status !== 'booked')

  const sessionMap = {}
  sessions.forEach((session) => {
    sessionMap[session.scheduled_slot] = session
  })

  function renderCell(day, time) {
    const session = sessionMap[slotKey(day, time)]
    if (!session) return null

    const isPending = session.status === 'booked'

    return (
      <div
        title={`${session.member_name} - ${session.goals || 'No goals specified'}\nStatus: ${session.status}`}
        className={cn(
          'absolute inset-0 flex items-center px-1 overflow-hidden',
          isPending
            ? 'bg-amber-500/15 border border-dashed border-amber-500'
            : 'bg-emerald-500/15 border border-emerald-500'
        )}
      >
        <span className="text-[10px] font-medium truncate leading-none">
          {session.member_name}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <motion.div className="flex flex-col gap-4 h-full min-h-0" variants={fadeUp} initial="hidden" animate="show">
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm border border-dashed border-amber-500 bg-amber-500/15" />
          Pending request
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm border border-emerald-500 bg-emerald-500/15" />
          Accepted
        </div>
      </div>

      <WeekGrid renderCell={renderCell} />

      <div className="grid gap-3 md:grid-cols-2">
        {actionableSessions.length === 0 && (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Confirmed coached sessions will appear here for equipment reservation.
          </div>
        )}

        {actionableSessions.map((session) => (
          <SessionReservationCard
            key={session.id}
            session={session}
            options={reservableEquipment}
            onReserved={() => queryClient.invalidateQueries({ queryKey: ['coach-sessions'] })}
          />
        ))}
      </div>
    </motion.div>
  )
}
