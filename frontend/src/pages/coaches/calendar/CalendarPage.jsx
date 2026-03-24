import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ScheduleTab from './components/ScheduleTab'
import AvailabilityTab from './components/AvailabilityTab'

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 px-6 h-full min-h-0">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your schedule and availability.</p>
      </div>

      <Tabs defaultValue="schedule" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-fit">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="availability">Your Availabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="flex flex-col flex-1 min-h-0 mt-4">
          <ScheduleTab />
        </TabsContent>

        <TabsContent value="availability" className="flex flex-col flex-1 min-h-0 mt-4">
          <AvailabilityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
