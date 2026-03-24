export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const TIMES = Array.from({ length: 28 }, (_, i) => {
  const mins = 7 * 60 + i * 30
  const h = String(Math.floor(mins / 60)).padStart(2, '0')
  const m = mins % 60 === 0 ? '00' : '30'
  return `${h}:${m}`
})

export const slotKey = (day, time) => `${day} ${time}`
