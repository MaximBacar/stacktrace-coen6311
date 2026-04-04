import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Pencil, X, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'
import { fetchAdminUsers, updateAdminUser, registerUser } from '../../lib/api'

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

function CreateForm({ onDone }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'member' })

  const mutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onDone()
    },
  })

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-medium">New member</p>
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'first_name', placeholder: 'First name' },
          { key: 'last_name',  placeholder: 'Last name'  },
          { key: 'email',      placeholder: 'Email'      },
          { key: 'password',   placeholder: 'Password', type: 'password' },
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

export default function AdminMembersPage() {
  const [editingId, setEditingId] = useState(null)
  const [creating, setCreating]   = useState(false)

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
  })
  const users = allUsers.filter(u => u.role === 'member')

  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all user accounts.</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="text-sm px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            + New account
          </button>
        )}
      </motion.div>

      {creating && (
        <CreateForm onDone={() => setCreating(false)} />
      )}

      {isLoading && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </motion.div>
      )}

      {!isLoading && users.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="rounded-2xl border p-5 bg-muted/30">
            <Users size={28} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No users found.</p>
        </motion.div>
      )}

      {!isLoading && users.length > 0 && (
        <motion.div variants={stagger(0.04)} className="flex flex-col gap-2">
          {users.map(user => (
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
                  <button
                    onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Pencil size={13} strokeWidth={1.5} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {editingId === user.id && (
                <EditRow user={user} onDone={() => setEditingId(null)} />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}