import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, Clock3, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

import { fadeUp, stagger } from './animations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createEquipment,
  deleteEquipment,
  fetchAdminEquipment,
  fetchAdminEquipmentIssues,
  fetchEquipmentReservations,
  fetchGyms,
  updateEquipment,
  updateEquipmentIssue,
} from '../../lib/api'

const EMPTY_FORM = {
  gym: '',
  name: '',
  category: '',
  quantity: 1,
  status: 'active',
  notes: '',
}

function EquipmentRow({ item, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    gym: item.gym,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    status: item.status,
    notes: item.notes,
  })

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      {editing ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm" />
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm" />
            <input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} className="h-10 rounded-lg border px-3 text-sm" />
            <Select value={form.status} onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows="3" className="rounded-lg border px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(item.id, form).then(() => setEditing(false))}
              className="rounded-lg bg-foreground px-3 py-2 text-sm text-background"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.gym_name} • {item.category || 'General equipment'}</p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.status}</span>
          </div>
          <p className="text-sm text-muted-foreground">{item.quantity} unit(s)</p>
          {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
            <button onClick={() => onDelete(item.id)} className="rounded-lg border px-3 py-2 text-sm text-destructive">Delete</button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function ReservationSummary({ selectedGymId, equipment }) {
  const equipmentIds = equipment.map((item) => item.id)
  const { data: reservations = [] } = useQuery({
    queryKey: ['equipment-reservations', selectedGymId],
    queryFn: () => fetchEquipmentReservations(),
  })

  const relevantReservations = reservations.filter((reservation) => equipmentIds.includes(reservation.equipment))

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Clock3 size={18} className="text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Real-time reservation tracking</h2>
          <p className="text-xs text-muted-foreground mt-1">Current equipment reservations for this gym.</p>
        </div>
      </div>

      {relevantReservations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active equipment reservations right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {relevantReservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{reservation.equipment_name} x{reservation.quantity}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {reservation.member_name} with {reservation.coach_name} • {reservation.session_slot}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function IssueManagementPanel({ selectedGymId }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['admin-equipment-issues', selectedGymId, statusFilter],
    queryFn: () => fetchAdminEquipmentIssues({
      gym_id: selectedGymId,
      ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    }),
    enabled: Boolean(selectedGymId),
  })

  const updateIssueMutation = useMutation({
    mutationFn: ({ issueId, data }) => updateEquipmentIssue(issueId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-equipment-issues'] }),
  })

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Equipment issue reports</h2>
            <p className="text-xs text-muted-foreground mt-1">Review member reports and keep maintenance status up to date.</p>
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-xl border bg-muted/30 animate-pulse" />)}
        </div>
      )}

      {!isLoading && issues.length === 0 && (
        <p className="text-sm text-muted-foreground">No issue reports match this gym and status filter.</p>
      )}

      {!isLoading && issues.length > 0 && (
        <div className="flex flex-col gap-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-xl border bg-muted/20 p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium">{issue.equipment_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reported by {issue.reporter_name} ({issue.reporter_email})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(issue.created_at).toLocaleString()}
                    {issue.resolved_at ? ` • Resolved ${new Date(issue.resolved_at).toLocaleString()}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{issue.status}</span>
              </div>

              <p className="text-sm text-muted-foreground">{issue.description}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateIssueMutation.mutate({ issueId: issue.id, data: { status: 'open' } })}
                  disabled={updateIssueMutation.isPending || issue.status === 'open'}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Mark open
                </button>
                <button
                  onClick={() => updateIssueMutation.mutate({ issueId: issue.id, data: { status: 'in_progress' } })}
                  disabled={updateIssueMutation.isPending || issue.status === 'in_progress'}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                >
                  In progress
                </button>
                <button
                  onClick={() => updateIssueMutation.mutate({ issueId: issue.id, data: { status: 'resolved' } })}
                  disabled={updateIssueMutation.isPending || issue.status === 'resolved'}
                  className="rounded-lg bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function EquipmentPage() {
  const queryClient = useQueryClient()
  const [selectedGymId, setSelectedGymId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: gyms = [] } = useQuery({
    queryKey: ['gyms'],
    queryFn: fetchGyms,
  })
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['admin-equipment', selectedGymId],
    queryFn: () => fetchAdminEquipment(selectedGymId || undefined),
  })

  useEffect(() => {
    if (gyms.length > 0 && !selectedGymId) {
      setSelectedGymId(String(gyms[0].id))
      setForm((current) => ({ ...current, gym: gyms[0].id }))
    }
  }, [gyms, selectedGymId])

  const createMutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] })
      setForm((current) => ({ ...EMPTY_FORM, gym: current.gym }))
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ equipmentId, data }) => updateEquipment(equipmentId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-equipment'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-equipment'] }),
  })

  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Equipment</h1>
        <p className="text-sm text-muted-foreground mt-1">Add, update, remove, and monitor equipment reservations in real time.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={selectedGymId}
            onValueChange={(val) => {
              setSelectedGymId(val)
              setForm((current) => ({ ...current, gym: Number(val) }))
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select gym" />
            </SelectTrigger>
            <SelectContent>
              {gyms.map((gym) => <SelectItem key={gym.id} value={String(gym.id)}>{gym.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Equipment name" className="h-10 rounded-lg border px-3 text-sm" />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category" className="h-10 rounded-lg border px-3 text-sm" />
          <input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} className="h-10 rounded-lg border px-3 text-sm" />
          <Select value={form.status} onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows="3" placeholder="Notes" className="rounded-lg border px-3 py-2 text-sm" />
        <button
          onClick={() => createMutation.mutate(form)}
          disabled={createMutation.isPending || !form.gym || !form.name}
          className="self-start rounded-lg bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
        >
          {createMutation.isPending ? 'Adding...' : 'Add equipment'}
        </button>
      </motion.div>

      {isLoading && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-36 rounded-xl border bg-muted/30 animate-pulse" />)}
        </motion.div>
      )}

      {!isLoading && selectedGymId && (
        <ReservationSummary selectedGymId={selectedGymId} equipment={equipment} />
      )}

      {selectedGymId && (
        <IssueManagementPanel selectedGymId={selectedGymId} />
      )}

      {!isLoading && equipment.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            {selectedGymId ? <CheckCircle2 size={28} strokeWidth={1.2} className="text-muted-foreground" /> : <Wrench size={28} strokeWidth={1.2} className="text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">No equipment has been added yet.</p>
        </motion.div>
      )}

      {!isLoading && equipment.length > 0 && (
        <motion.div variants={stagger(0.06)} className="flex flex-col gap-3">
          {equipment.map((item) => (
            <EquipmentRow
              key={item.id}
              item={item}
              onSave={(equipmentId, data) => updateMutation.mutateAsync({ equipmentId, data })}
              onDelete={(equipmentId) => deleteMutation.mutate(equipmentId)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
