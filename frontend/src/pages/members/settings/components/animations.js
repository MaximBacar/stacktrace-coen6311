export const spring  = { type: 'spring', stiffness: 100, damping: 20 }
export const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } }
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
