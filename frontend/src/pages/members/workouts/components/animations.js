export const spring = { type: 'spring', stiffness: 100, damping: 20 }

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: spring },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }

export const collapse = {
  hidden: { height: 0, opacity: 0 },
  show:   { height: 'auto', opacity: 1, transition: { ...spring, opacity: { duration: 0.2 } } },
  exit:   { height: 0, opacity: 0, transition: { duration: 0.2 } },
}