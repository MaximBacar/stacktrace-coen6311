import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChipToggle({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all active:scale-[0.97]',
        selected
          ? 'bg-foreground text-background border-foreground'
          : 'text-muted-foreground hover:text-foreground hover:border-foreground/30'
      )}
    >
      {selected && <Check size={11} strokeWidth={2.5} />}
      {label}
    </button>
  )
}
