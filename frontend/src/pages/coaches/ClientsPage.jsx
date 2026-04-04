import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Users, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'
import ChatPanel from '@/components/chat/ChatPanel'
import { fetchAssignedClients, getOrCreateChat } from '@/lib/api'

export default function ClientsPage() {
  const [activeChatId, setActiveChatId] = useState(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['assignedClients'],
    queryFn: fetchAssignedClients,
  })

  const openChatMutation = useMutation({
    mutationFn: (memberId) => getOrCreateChat(memberId),
    onSuccess: (chat) => setActiveChatId(chat.id),
  })

  return (
    <motion.div
      className="w-full h-full min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 px-6 overflow-hidden"
      variants={stagger()}
      initial="hidden"
      animate="show"
    >
      {/* Left — client list */}
      <div className="flex flex-col gap-6 min-h-0 overflow-y-auto">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Members you are currently working with.</p>
        </motion.div>

        {isLoading && (
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl border bg-muted/30 animate-pulse" />
            ))}
          </motion.div>
        )}

        {!isLoading && clients.length === 0 && (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
            <div className="rounded-2xl border p-5 bg-muted/30">
              <Users size={28} strokeWidth={1.2} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-1">Accepted session requests will appear here as active clients.</p>
            </div>
          </motion.div>
        )}

        {!isLoading && clients.length > 0 && (
          <motion.div variants={stagger(0.05)} className="flex flex-col gap-3">
            {clients.map(client => (
              <motion.div
                key={client.id}
                variants={fadeUp}
                className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                    {client.first_name?.[0]}{client.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{client.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => openChatMutation.mutate(client.id)}
                  disabled={openChatMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
                >
                  <MessageCircle size={13} strokeWidth={1.5} />
                  Message
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right — chat panel */}
      <motion.div variants={fadeUp} className="h-full min-h-0 py-1">
        <ChatPanel activeChatId={activeChatId} onChatChange={setActiveChatId} />
      </motion.div>
    </motion.div>
  )
}
