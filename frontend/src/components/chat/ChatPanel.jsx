import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { fetchChats, fetchMessages, sendMessage } from '@/lib/api'

/**
 * Shared chat panel — works for any user type.
 * Props:
 *   activeChatId  — pre-select a chat (e.g. after get-or-create from a parent)
 *   onChatChange  — called with chatId whenever selection changes
 */
export default function ChatPanel({ activeChatId = null, onChatChange }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(activeChatId)
  const [input, setInput]           = useState('')
  const bottomRef                   = useRef(null)

  // Sync when parent opens a specific chat
  useEffect(() => {
    if (activeChatId) setSelectedId(activeChatId)
  }, [activeChatId])

  function selectChat(id) {
    setSelectedId(id)
    onChatChange?.(id)
  }

  // ── Chats list ────────────────────────────────────────────────────────────
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  })

  // ── Messages ──────────────────────────────────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => fetchMessages(selectedId),
    enabled: Boolean(selectedId),
    refetchInterval: 3000,
    refetchOnWindowFocus: false,
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (content) => sendMessage(selectedId, content),
    onSuccess: (newMsg) => {
      queryClient.setQueryData(['messages', selectedId], old => [...(old ?? []), newMsg])
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setInput('')
    },
  })

  function handleSend() {
    const content = input.trim()
    if (!content || sendMutation.isPending) return
    sendMutation.mutate(content)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function otherUser(chat) {
    return chat.user1.id === user?.id ? chat.user2 : chat.user1
  }

  const selectedChat = chats.find(c => c.id === selectedId) ?? null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-card">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        {selectedChat && (
          <button onClick={() => selectChat(null)} className="p-1 -ml-1 rounded hover:bg-muted transition-colors">
            <ArrowLeft size={15} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        )}
        <MessageSquare size={15} strokeWidth={1.5} className="text-muted-foreground" />
        <span className="text-sm font-medium">
          {selectedChat ? otherUser(selectedChat).full_name : 'Messages'}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!selectedChat ? (
          /* ── Chat list ── */
          <motion.div key="list" className="flex-1 overflow-y-auto divide-y"
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {chats.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-10">No conversations yet.</p>
            )}
            {chats.map(chat => {
              const other = otherUser(chat)
              return (
                <button key={chat.id} onClick={() => selectChat(chat.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                    {other.full_name?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{other.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {chat.last_message?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })}
          </motion.div>
        ) : (
          /* ── Thread ── */
          <motion.div key="thread" className="flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-8">Say hello!</p>
              )}
              {messages.map(msg => {
                const isMe = msg.sender.id === user?.id
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
                      isMe
                        ? 'bg-foreground text-background rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2 flex items-center gap-2 shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="p-1.5 rounded-lg bg-foreground text-background disabled:opacity-30 transition-opacity">
                <Send size={13} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
