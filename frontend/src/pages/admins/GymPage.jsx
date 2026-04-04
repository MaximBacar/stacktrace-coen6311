import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'
import { fetchGyms, fetchGymCapacity, updateGymCapacity } from '../../lib/api'

const STATUS_COLOURS = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-yellow-100 text-yellow-700',
  red:   'bg-red-100 text-red-700',
}

function CapacityCard({ gym }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})

  const { data: capacity, isLoading } = useQuery({
    queryKey: ['gymCapacity', gym.id],
    queryFn:  () => fetchGymCapacity(gym.id),
  })

  const mutation = useMutation({
    mutationFn: (data) => updateGymCapacity(gym.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gymCapacity', gym.id] })
      setEditing(false)
    },
  })

  function handleEdit() {
    setForm({
      current_occupancy: capacity.current_occupancy,
      max_capacity:      capacity.max_capacity,
    })
    setEditing(true)
  }

  if (isLoading) {
    return <div className="h-32 rounded-xl border bg-muted/30 animate-pulse" />
  }

  const pct = capacity?.occupancy_percentage ?? 0

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{capacity.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {capacity.current_occupancy} / {capacity.max_capacity} occupants
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[capacity.occupancy_status] ?? 'bg-muted text-muted-foreground'}`}>
          {capacity.occupancy_status === 'green' ? 'Available'
            : capacity.occupancy_status === 'amber' ? 'Busy'
            : 'Full'}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            capacity.occupancy_status === 'green' ? 'bg-green-500'
              : capacity.occupancy_status === 'amber' ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {editing ? (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Current occupancy</label>
            <input
              type="number"
              min={0}
              value={form.current_occupancy}
              onChange={e => setForm(f => ({ ...f, current_occupancy: Number(e.target.value) }))}
              className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Max capacity</label>
            <input
              type="number"
              min={1}
              value={form.max_capacity}
              onChange={e => setForm(f => ({ ...f, max_capacity: Number(e.target.value) }))}
              className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-28"
            />
          </div>
          <div className="flex gap-2 self-end">
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
          {mutation.isError && (
            <p className="text-xs text-destructive w-full">
              {mutation.error?.response?.data?.current_occupancy?.[0]
                ?? mutation.error?.response?.data?.max_capacity?.[0]
                ?? 'Failed to update capacity.'}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="self-start text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors"
        >
          Update capacity
        </button>
      )}
    </motion.div>
  )
}

export default function GymPage() {
  const { data: gyms = [], isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn:  fetchGyms,
  })

  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Gym</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and update real-time occupancy for each gym.</p>
      </motion.div>

      {isLoading && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </motion.div>
      )}

      {!isLoading && gyms.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Activity size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No gyms found.</p>
        </motion.div>
      )}

      {!isLoading && gyms.length > 0 && (
        <motion.div variants={stagger(0.06)} className="flex flex-col gap-3">
          {gyms.map(gym => <CapacityCard key={gym.id} gym={gym} />)}
        </motion.div>
      )}
    </motion.div>
  )
}
