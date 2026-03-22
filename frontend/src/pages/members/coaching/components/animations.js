export const spring = { type: 'spring', stiffness: 100, damping: 20 }

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: spring },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const stagger = (d = 0.06) => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
})