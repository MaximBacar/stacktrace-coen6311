import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8 px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">Members you are currently working with.</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="rounded-2xl border p-5 bg-muted/30">
          <Users size={28} strokeWidth={1.2} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No clients yet</p>
          <p className="text-sm text-muted-foreground mt-1">Accepted session requests will appear here as active clients.</p>
        </div>
      </div>
    </div>
  )
}
