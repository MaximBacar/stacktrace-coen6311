import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Pencil, X, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'
import { fetchAdminUsers, updateAdminUser, registerUser, approveCoach } from '../../lib/api'

const TABS = ['Coaches', 'Admins']

const COACH_STATUS_COLOURS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function EditRow({ user, onDone }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name:  user.last_name,
    email:      user.email,
    password:   '',
  })

  const mutation = useMutation({
    mutationFn: (data) => updateAdminUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onDone()
    },
  })

  function handleSave() {
    const payload = { ...form }
    if (!payload.password) delete payload.password
    mutation.mutate(payload)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      {[
        { key: 'first_name', placeholder: 'First name' },
        { key: 'last_name',  placeholder: 'Last name'  },
        { key: 'email',      placeholder: 'Email'      },
        { key: 'password',   placeholder: 'New password (optional)', type: 'password' },
      ].map(({ key, placeholder, type = 'text' }) => (
        <input
          key={key}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-36"
        />
      ))}
      <button
        onClick={handleSave}
        disabled={mutation.isPending}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-50 transition-opacity"
      >
        <Check size={12} /> Save
      </button>
      <button
        onClick={onDone}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
      >
        <X size={12} /> Cancel
      </button>
      {mutation.isError && (
        <p className="text-xs text-destructive w-full">Failed to save changes.</p>
      )}
    </div>
  )
}

function RejectForm({ coachId, onDone }) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: () => approveCoach(coachId, { status: 'rejected', rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onDone()
    },
  })

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      <input
        type="text"
        placeholder="Rejection reason"
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-48"
      />
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !reason.trim()}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground disabled:opacity-50"
      >
        <Check size={12} /> Confirm
      </button>
      <button
        onClick={onDone}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
      >
        <X size={12} /> Cancel
      </button>
    </div>
  )
}

function CreateForm({ role, onDone }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role })

  const mutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onDone()
    },
  })

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-medium">New {role}</p>
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'first_name', placeholder: 'First name' },
          { key: 'last_name',  placeholder: 'Last name'  },
          { key: 'email',      placeholder: 'Email'      },
          { key: 'password',   placeholder: 'Password', type: 'password' },
          ...(role === 'coach' ? [{ key: 'biography', placeholder: 'Biography' }] : []),
        ].map(({ key, placeholder, type = 'text' }) => (
          <input
            key={key}
            type={type}
            placeholder={placeholder}
            value={form[key] ?? ''}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-36"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="text-xs px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-50"
        >
          Create
        </button>
        <button
          onClick={onDone}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        {mutation.isError && (
          <p className="text-xs text-destructive self-center">Failed to create account.</p>
        )}
      </div>
    </motion.div>
  )
}

function CoachRow({ user }) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId]   = useState(null)
  const [rejectingId, setRejectingId] = useState(null)

  const approveMutation = useMutation({
    mutationFn: () => approveCoach(user.id, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })

  return (
    <motion.div key={user.id} variants={fadeUp} className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {user.coach_status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COACH_STATUS_COLOURS[user.coach_status] ?? 'bg-muted text-muted-foreground'}`}>
              {user.coach_status}
            </span>
          )}
          {user.coach_status !== 'approved' && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="text-xs px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
          )}
          {user.coach_status !== 'rejected' && (
            <button
              onClick={() => setRejectingId(rejectingId === user.id ? null : user.id)}
              className="text-xs px-2 py-1 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
            >
              Reject
            </button>
          )}
          <button
            onClick={() => setEditingId(editingId === user.id ? null : user.id)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil size={13} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {rejectingId === user.id && (
        <RejectForm coachId={user.id} onDone={() => setRejectingId(null)} />
      )}
      {editingId === user.id && (
        <EditRow user={user} onDone={() => setEditingId(null)} />
      )}
    </motion.div>
  )
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('Coaches')
  const [creating, setCreating]   = useState(false)

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
  })

  const [editingId, setEditingId] = useState(null)

  const coaches = allUsers.filter(u => u.role === 'coach')
  const admins  = allUsers.filter(u => u.role === 'admin')
  const users   = activeTab === 'Coaches' ? coaches : admins

  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage coaches and administrators.</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="text-sm px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            + New {activeTab === 'Coaches' ? 'coach' : 'admin'}
          </button>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-1 border-b">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCreating(false) }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {tab === 'Coaches' ? coaches.length : admins.length}
            </span>
          </button>
        ))}
      </motion.div>

      {creating && (
        <CreateForm role={activeTab === 'Coaches' ? 'coach' : 'admin'} onDone={() => setCreating(false)} />
      )}

      {isLoading && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </motion.div>
      )}

      {!isLoading && users.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Users size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No {activeTab.toLowerCase()} found.</p>
        </motion.div>
      )}

      {!isLoading && users.length > 0 && (
        <motion.div variants={stagger(0.04)} className="flex flex-col gap-2">
          {activeTab === 'Coaches'
            ? users.map(user => <CoachRow key={user.id} user={user} />)
            : users.map(user => (
                <motion.div key={user.id} variants={fadeUp} className="rounded-xl border bg-card px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Pencil size={13} strokeWidth={1.5} className="text-muted-foreground" />
                    </button>
                  </div>
                  {editingId === user.id && (
                    <EditRow user={user} onDone={() => setEditingId(null)} />
                  )}
                </motion.div>
              ))
          }
        </motion.div>
      )}
    </motion.div>
  )
}
