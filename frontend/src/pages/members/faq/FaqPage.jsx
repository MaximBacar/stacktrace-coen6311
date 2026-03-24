import { useState, useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Plus, MessageSquare, Sparkles, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  fetchConversations,
  createConversation,
  fetchConversationDetail,
  sendAssistantMessage,
  deleteConversation,
} from '@/lib/api'

export default function FaqPage() {
  const queryClient                         = useQueryClient()
  const [selectedId, setSelectedId]         = useState(null)
  const [input, setInput]                   = useState('')
  const [localMessages, setLocalMessages]   = useState([])
  const [isWaiting, setIsWaiting]           = useState(false)
  const bottomRef                           = useRef(null)
  const inputRef                            = useRef(null)

  // ── Conversations list ─────────────────────────────────────────────────────
  const { data: conversations = [] } = useQuery({
    queryKey: ['assistant-conversations'],
    queryFn: fetchConversations,
    refetchOnWindowFocus: false,
  })

  // ── Load conversation messages ─────────────────────────────────────────────
  const { data: detail } = useQuery({
    queryKey: ['assistant-conversation', selectedId],
    queryFn: () => fetchConversationDetail(selectedId),
    enabled: Boolean(selectedId),
    refetchOnWindowFocus: false,
  })

  // Sync messages when switching conversation (covers both cached and fresh loads)
  useEffect(() => {
    if (detail && detail.conversation_id === selectedId) {
      setLocalMessages(detail.messages)
    } else {
      setLocalMessages([])
    }
  }, [selectedId, detail])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, isWaiting])

  // ── Start new conversation ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assistant-conversations'] })
      setSelectedId(data.conversation_id)
      setLocalMessages(prev => [...prev, { ...data.reply }])
      setIsWaiting(false)
    },
    onError: () => setIsWaiting(false),
  })

  // ── Delete conversation ────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['assistant-conversations'] })
      if (selectedId === deletedId) {
        setSelectedId(null)
        setLocalMessages([])
      }
    },
  })

  function handleDelete(e, id) {
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  // ── Send follow-up ─────────────────────────────────────────────────────────
  const replyMutation = useMutation({
    mutationFn: (message) => sendAssistantMessage(selectedId, message),
    onSuccess: (reply) => {
      setLocalMessages(prev => [...prev, reply])
      setIsWaiting(false)
    },
    onError: () => setIsWaiting(false),
  })

  function handleSend() {
    const text = input.trim()
    if (!text || isWaiting) return

    // Optimistically add user message
    const userMsg = { id: `local-${Date.now()}`, content: text, from_assistant: false, timestamp: new Date().toISOString() }
    setIsWaiting(true)
    setInput('')

    setLocalMessages(prev => [...prev, userMsg])

    if (!selectedId) {
      createMutation.mutate(text)
    } else {
      replyMutation.mutate(text)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function startNew() {
    setSelectedId(null)
    setLocalMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  const selectedConversation = conversations.find(c => c.id === selectedId) ?? null
  const isIdle = !selectedId && localMessages.length === 0

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 px-6 gap-4">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col gap-2">
        <button
          onClick={startNew}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          New conversation
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          <AnimatePresence initial={false}>
            {conversations.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'group flex items-center gap-1 w-full rounded-lg text-sm transition-colors',
                  selectedId === c.id
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <button
                  onClick={() => setSelectedId(c.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 text-left"
                >
                  <MessageSquare size={13} strokeWidth={1.5} className="shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  disabled={deleteMutation.isPending}
                  className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden bg-card">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <Sparkles size={15} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="text-sm font-medium">
            {selectedConversation ? selectedConversation.title : 'Fitness Assistant'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {isIdle && (
            <div className="m-auto text-center flex flex-col items-center gap-3 text-muted-foreground">
              <Sparkles size={32} strokeWidth={1} />
              <p className="text-sm">Ask me anything about workouts, nutrition, or your gym membership.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {localMessages.map((msg, i) => (
              <motion.div
                key={msg.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex', msg.from_assistant ? 'justify-start' : 'justify-end')}
              >
                {msg.from_assistant && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles size={12} strokeWidth={1.5} className="text-muted-foreground" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  msg.from_assistant
                    ? 'bg-muted text-foreground rounded-bl-sm prose prose-sm dark:prose-invert max-w-none'
                    : 'bg-foreground text-background rounded-br-sm whitespace-pre-wrap'
                )}>
                  {msg.from_assistant
                    ? <Markdown>{msg.content}</Markdown>
                    : msg.content
                  }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isWaiting && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2 shrink-0">
                <Sparkles size={12} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground block"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Prompt bar */}
        <div className="border-t px-4 py-3 flex items-end gap-3 shrink-0">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the assistant…"
            className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground leading-relaxed max-h-36 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isWaiting}
            className="p-2 rounded-lg bg-foreground text-background disabled:opacity-30 transition-opacity shrink-0"
          >
            <Send size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
