export const spring     = { type: 'spring', stiffness: 100, damping: 20 }
export const springSlow = { type: 'spring', stiffness: 60,  damping: 20 }

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: spring },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15 } },
}

export const stagger = (d = 0.07) => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
})

export const collapse = {
  hidden: { height: 0, opacity: 0 },
  show:   { height: 'auto', opacity: 1, transition: { ...spring, opacity: { duration: 0.2 } } },
  exit:   { height: 0, opacity: 0, transition: { duration: 0.2 } },
}
