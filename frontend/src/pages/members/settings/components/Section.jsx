import { motion } from 'framer-motion'
import { fadeUp } from './animations'

export default function Section({ title, description, children }) {
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-8 first:pt-0">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </motion.div>
  )
}
