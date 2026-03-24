import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchAvailability, saveAvailability } from '@/lib/api'
import WeekGrid from './WeekGrid'
import { slotKey } from './constants'

export default function AvailabilityTab() {
  const queryClient = useQueryClient()
  const [slotSet,    setSlotSet]    = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode,   setDragMode]   = useState('add')

  const { data: fetched = [], isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: fetchAvailability,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (slotSet === null && fetched.length >= 0) setSlotSet(new Set(fetched))
  }, [fetched])

  const current = slotSet ?? new Set()
  const fetchedSet = new Set(fetched)
  const isDirty = slotSet !== null &&
    !([...current].every(s => fetchedSet.has(s)) && [...fetchedSet].every(s => current.has(s)))

  const saveMutation = useMutation({
    mutationFn: () => saveAvailability([...current]),
    onSuccess:  () => queryClient.setQueryData(['availability'], [...current]),
  })

  function applyMode(day, time, mode) {
    const k = slotKey(day, time)
    setSlotSet(prev => {
      const next = new Set(prev)
      mode === 'add' ? next.add(k) : next.delete(k)
      return next
    })
  }

  function handleMouseDown(day, time) {
    const mode = current.has(slotKey(day, time)) ? 'remove' : 'add'
    setDragMode(mode)
    setIsDragging(true)
    applyMode(day, time, mode)
  }

  function handleMouseEnter(day, time) {
    if (isDragging) applyMode(day, time, dragMode)
  }

  function renderCell(day, time) {
    const active = current.has(slotKey(day, time))
    return (
      <div className={cn(
        'w-full h-full cursor-pointer transition-colors duration-75',
        active ? 'bg-foreground/85 hover:bg-foreground' : 'hover:bg-muted/50'
      )} />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          Click or drag cells to set your weekly recurring availability.
        </p>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
          className="gap-1.5 h-8 text-xs"
        >
          <Save size={12} strokeWidth={2} />
          {saveMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <WeekGrid
        renderCell={renderCell}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={() => setIsDragging(false)}
      />
    </div>
  )
}
