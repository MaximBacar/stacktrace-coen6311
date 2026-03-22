import { Inbox } from 'lucide-react'

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-8 px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Session Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and respond to booking requests from members.</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="rounded-2xl border p-5 bg-muted/30">
          <Inbox size={28} strokeWidth={1.2} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No pending requests</p>
          <p className="text-sm text-muted-foreground mt-1">New session requests from members will show up here.</p>
        </div>
      </div>
    </div>
  )
}
