import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, X, Check, Tag } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fadeUp, stagger } from './animations'
import {
  fetchGyms,
  fetchPolicyCategories,
  createPolicyCategory,
  deletePolicyCategory,
  fetchPolicies,
  fetchCancellationPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  createCancellationPolicy,
  updateCancellationPolicy,
  deleteCancellationPolicy,
} from '@/lib/api'

const TABS = [
  { key: 'general',      label: 'General'      },
  { key: 'cancellation', label: 'Cancellation' },
]

// ── Categories section ────────────────────────────────────────────────────────

function CategoriesSection({ gymId, categories }) {
  const qc = useQueryClient()
  const [open,     setOpen]     = useState(false)
  const [adding,   setAdding]   = useState(false)
  const [newName,  setNewName]  = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const catKey = ['policy-categories', gymId]

  const createMutation = useMutation({
    mutationFn: (data) => createPolicyCategory(gymId, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: catKey }); setNewName(''); setAdding(false) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePolicyCategory(gymId, id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: catKey }),
  })

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    createMutation.mutate({ name })
  }

  return (
    <motion.div variants={fadeUp} className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag size={14} />
          <span>Categories</span>
          {categories.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{categories.length}</span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {categories.map(c => (
                <span key={c.id} className="group flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-xs">
                  {c.name}
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="ml-0.5 opacity-40 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {adding ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    className="rounded-full border bg-background px-3 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-foreground"
                    placeholder="Category name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
                  />
                  <button onClick={handleAdd} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setAdding(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  <Plus size={11} /> Add category
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Inline editor ─────────────────────────────────────────────────────────────

function PolicyForm({ initial = {}, categories, isCancellation, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:          initial.title          ?? '',
    content:        initial.content        ?? '',
    category:       initial.category       ?? '',
    penalty_type:   initial.penalty_type   ?? 'none',
    penalty_amount: initial.penalty_amount ?? 0,
    notice_hours:   initial.notice_hours   ?? 24,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-muted/30">
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={set('title')}
        />
        <Select value={form.category || 'none'} onValueChange={(v) => setForm(f => ({ ...f, category: v === 'none' ? '' : v }))}>
          <SelectTrigger>
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <textarea
        className="rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
        placeholder="Content"
        value={form.content}
        onChange={set('content')}
      />
      {isCancellation && (
        <div className="flex gap-3">
          <Select value={form.penalty_type} onValueChange={(v) => setForm(f => ({ ...f, penalty_type: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No penalty</SelectItem>
              <SelectItem value="fixed">Fixed fee</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
          {form.penalty_type !== 'none' && (
            <input
              type="number" min="0"
              className="w-28 rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder={form.penalty_type === 'fixed' ? 'Amount ($)' : 'Percent (%)'}
              value={form.penalty_amount}
              onChange={set('penalty_amount')}
            />
          )}
          <input
            type="number" min="0"
            className="w-32 rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="Notice hours"
            value={form.notice_hours}
            onChange={set('notice_hours')}
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
          <X size={14} /> Cancel
        </button>
        <button onClick={() => onSave(form)} className="flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1.5 text-sm hover:opacity-80">
          <Check size={14} /> Save
        </button>
      </div>
    </div>
  )
}

// ── Policy row ────────────────────────────────────────────────────────────────

function PolicyRow({ policy, categories, gymId, isCancellation, queryKey }) {
  const qc = useQueryClient()
  const [editing, setEditing]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  const updateFn = isCancellation ? updateCancellationPolicy : updatePolicy
  const deleteFn = isCancellation ? deleteCancellationPolicy : deletePolicy

  const editMutation = useMutation({
    mutationFn: (data) => updateFn(gymId, policy.id, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey }); setEditing(false) },
  })
  const deleteMutation = useMutation({
    mutationFn: () => deleteFn(gymId, policy.id),
    onSuccess:  () => qc.invalidateQueries({ queryKey }),
  })

  if (editing) {
    return (
      <PolicyForm
        initial={policy}
        categories={categories}
        isCancellation={isCancellation}
        onSave={(data) => editMutation.mutate(data)}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
          <span className="font-medium text-sm">{policy.title}</span>
          {policy.category_name && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{policy.category_name}</span>
          )}
          {isCancellation && policy.penalty_type !== 'none' && (
            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-full px-2 py-0.5">
              {policy.penalty_type === 'fixed' ? `$${policy.penalty_amount}` : `${policy.penalty_amount}%`} · {policy.notice_hours}h notice
            </span>
          )}
        </button>
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <Pencil size={13} />
        </button>
        <button onClick={() => deleteMutation.mutate()} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
          <Trash2 size={13} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-10 pb-4 text-sm text-muted-foreground whitespace-pre-wrap">{policy.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const [activeTab,   setActiveTab]   = useState('general')
  const [gymId,       setGymId]       = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const qc = useQueryClient()

  const { data: gyms = [] } = useQuery({ queryKey: ['gyms'], queryFn: fetchGyms,
    onSuccess: (data) => { if (data.length && !gymId) setGymId(data[0].id) },
  })

  // Set gymId once gyms are loaded
  const effectiveGymId = gymId ?? gyms[0]?.id

  const isCancellation = activeTab === 'cancellation'
  const policiesKey    = isCancellation ? ['cancellation-policies', effectiveGymId] : ['policies', effectiveGymId]

  const { data: categories = [] } = useQuery({
    queryKey: ['policy-categories', effectiveGymId],
    queryFn:  () => fetchPolicyCategories(effectiveGymId),
    enabled:  !!effectiveGymId,
  })
  const { data: policies = [], isLoading } = useQuery({
    queryKey: policiesKey,
    queryFn:  () => isCancellation ? fetchCancellationPolicies(effectiveGymId) : fetchPolicies(effectiveGymId),
    enabled:  !!effectiveGymId,
  })

  const createFn = isCancellation ? createCancellationPolicy : createPolicy
  const createMutation = useMutation({
    mutationFn: (data) => createFn(effectiveGymId, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: policiesKey }); setShowNewForm(false) },
  })

  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage gym policies and cancellation rules.</p>
        </div>
        <div className="flex items-center gap-3">
          {gyms.length > 1 && (
            <Select value={String(effectiveGymId ?? '')} onValueChange={(v) => setGymId(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gyms.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-2 text-sm hover:opacity-80"
          >
            <Plus size={14} /> Add policy
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setShowNewForm(false) }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      <CategoriesSection gymId={effectiveGymId} categories={categories} />

      <motion.div variants={stagger(0.05)} className="flex flex-col gap-3">
        <AnimatePresence>
          {showNewForm && (
            <motion.div key="new-form" variants={fadeUp} initial="hidden" animate="show" exit="exit">
              <PolicyForm
                categories={categories}
                isCancellation={isCancellation}
                onSave={(data) => createMutation.mutate(data)}
                onCancel={() => setShowNewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
        )}

        {!isLoading && policies.length === 0 && !showNewForm && (
          <motion.div variants={fadeUp} className="rounded-xl border border-dashed flex items-center justify-center h-40 text-sm text-muted-foreground">
            No {activeTab} policies yet
          </motion.div>
        )}

        {policies.map(p => (
          <motion.div key={p.id} variants={fadeUp}>
            <PolicyRow
              policy={p}
              categories={categories}
              gymId={effectiveGymId}
              isCancellation={isCancellation}
              queryKey={policiesKey}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
