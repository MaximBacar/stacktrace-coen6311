import { Star, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeUp } from './animations'

export default function CoachRow({ coach, onBook }) {
  return (
    <motion.div
      layout
      variants={fadeUp}
      className="flex items-start justify-between gap-4 py-5 px-1 group"
    >
      <div className="flex items-start gap-4">
        <img src={coach.avatar_url} alt={coach.full_name} className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{coach.full_name}</p>
            <div className="flex items-center gap-0.5">
              <Star size={11} className="fill-foreground text-foreground" />
              <span className="text-xs">{coach.rating}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{coach.specialty}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(coach.tags ?? []).map(t => (
              <span key={t} className="text-[11px] border rounded-full px-2 py-0.5 text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">${coach.price}</p>
          <p className="text-xs text-muted-foreground">/ session</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onBook(coach)} className="gap-1.5 h-8 text-xs">
          Book
          <ChevronRight size={12} strokeWidth={2} />
        </Button>
      </div>
    </motion.div>
  )
}
