import { CalendarDays } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 px-6 h-full min-h-0">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Your weekly schedule and upcoming sessions.</p>
      </div>

      <div className="rounded-xl border overflow-auto flex-1">
        <div className="grid min-w-[600px]" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
          <div className="border-b border-r bg-muted/30 h-10" />
          {DAYS.map(d => (
            <div key={d} className="border-b border-r last:border-r-0 h-10 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">{d}</span>
            </div>
          ))}

          {HOURS.map(hour => (
            <>
              <div key={`h-${hour}`} className="border-b border-r flex items-start pt-1 px-2 h-14">
                <span className="text-[11px] text-muted-foreground">{hour}</span>
              </div>
              {DAYS.map(day => (
                <div key={`${day}-${hour}`} className="border-b border-r last:border-r-0 h-14 hover:bg-muted/20 transition-colors" />
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
