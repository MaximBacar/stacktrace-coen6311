import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

import { fetchGyms, fetchGymEquipment, reportEquipmentIssue } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const STATUS_TONE = {
  available: 'bg-green-100 text-green-700',
  limited: 'bg-yellow-100 text-yellow-700',
  unavailable: 'bg-red-100 text-red-700',
  maintenance: 'bg-slate-200 text-slate-700',
}

function EquipmentCard({ item }) {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()
  const [description, setDescription] = useState('')
  const reportMutation = useMutation({
    mutationFn: (payload) => reportEquipmentIssue(item.id, payload),
    onSuccess: () => {
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['gym-equipment', item.gym] })
    },
  })
  const fill = item.total_units > 0 ? Math.min((item.available_units / item.total_units) * 100, 100) : 0

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isAuthenticated || !user?.user_id) {
      return
    }

    reportMutation.mutate({ description })
  }

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.category || 'General equipment'}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_TONE[item.availability_status] ?? 'bg-muted text-muted-foreground'}`}>
          {item.availability_status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>{item.available_units} available</span>
          <span className="text-muted-foreground">{item.total_units} total</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              item.availability_status === 'available' ? 'bg-green-500'
                : item.availability_status === 'limited' ? 'bg-yellow-500'
                : item.availability_status === 'maintenance' ? 'bg-slate-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>

      {item.notes && (
        <p className="text-sm text-muted-foreground">{item.notes}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Report equipment issue
        </p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows="3"
          required
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Describe what is broken or unavailable."
        />
        <button
          type="submit"
          disabled={!isAuthenticated || reportMutation.isPending}
          className="rounded-lg bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
        >
          {reportMutation.isPending ? 'Reporting...' : 'Report issue'}
        </button>
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground">Sign in as a member to report equipment issues.</p>
        )}
        {reportMutation.isSuccess && (
          <p className="text-xs text-green-700">Issue reported to gym staff.</p>
        )}
        {reportMutation.isError && (
          <p className="text-xs text-red-600">
            {reportMutation.error?.response?.data?.description?.[0] ?? reportMutation.error?.response?.data?.error ?? 'Could not submit the report.'}
          </p>
        )}
      </form>
    </motion.div>
  )
}

function GymEquipmentSection({ gym, statusFilter, searchTerm }) {
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['gym-equipment', gym.id, statusFilter],
    queryFn: () => fetchGymEquipment(gym.id, statusFilter === 'all' ? {} : { status: statusFilter }),
  })

  const filteredEquipment = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return equipment
    }
    return equipment.filter((item) =>
      [item.name, item.category, item.notes].filter(Boolean).join(' ').toLowerCase().includes(query)
    )
  }, [equipment, searchTerm])

  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{gym.name}</h2>
          <p className="text-sm text-muted-foreground">Check equipment availability before you head out.</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filteredEquipment.length === 0 && (
        <div className="rounded-xl border border-dashed flex items-center justify-center min-h-36 text-sm text-muted-foreground">
          No equipment availability matches your filters for this gym.
        </div>
      )}

      {!isLoading && filteredEquipment.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
          {filteredEquipment.map((item) => <EquipmentCard key={item.id} item={item} />)}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function EquipmentAvailabilityPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: gyms = [], isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: fetchGyms,
  })

  return (
    <motion.div className="flex flex-col gap-8 px-6 py-2" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Equipment Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">See what equipment is open before planning your gym session.</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search equipment, category, or notes"
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring md:max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring md:w-48"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && gyms.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Activity size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No gyms available yet.</p>
        </motion.div>
      )}

      {!isLoading && gyms.length > 0 && (
        <motion.div variants={stagger} className="flex flex-col gap-8">
          {gyms.map((gym) => (
            <GymEquipmentSection key={gym.id} gym={gym} statusFilter={statusFilter} searchTerm={searchTerm} />
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground flex items-start gap-3">
        <Wrench size={18} className="mt-0.5 shrink-0" />
        Availability reflects the latest updates published by gym staff and may change during peak hours.
      </motion.div>
    </motion.div>
  )
}
