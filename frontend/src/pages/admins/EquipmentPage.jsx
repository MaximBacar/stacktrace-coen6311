import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

import { fadeUp, stagger } from './animations'
import { createEquipment, deleteEquipment, fetchAdminEquipment, fetchGyms, updateEquipment } from '../../lib/api'

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
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm">
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
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
        <p className="text-sm text-muted-foreground mt-1">Add, update, and remove gym equipment.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border bg-card p-5 flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={selectedGymId}
            onChange={(e) => {
              setSelectedGymId(e.target.value)
              setForm((current) => ({ ...current, gym: Number(e.target.value) }))
            }}
            className="h-10 rounded-lg border px-3 text-sm"
          >
            {gyms.map((gym) => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
          </select>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Equipment name" className="h-10 rounded-lg border px-3 text-sm" />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category" className="h-10 rounded-lg border px-3 text-sm" />
          <input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} className="h-10 rounded-lg border px-3 text-sm" />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm">
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
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

      {!isLoading && equipment.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Wrench size={28} strokeWidth={1.2} className="text-muted-foreground" />
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
