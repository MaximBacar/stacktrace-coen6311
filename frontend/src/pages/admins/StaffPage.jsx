import { motion } from 'framer-motion'
import { fadeUp, stagger } from './animations'

export default function StaffPage() {
  return (
    <motion.div className="flex flex-col gap-6 px-6" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage coaches and administrators.</p>
      </motion.div>
      <motion.div variants={fadeUp} className="rounded-xl border border-dashed flex items-center justify-center h-64 text-sm text-muted-foreground">
        Staff management coming soon
      </motion.div>
    </motion.div>
  )
}