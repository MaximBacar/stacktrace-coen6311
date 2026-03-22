export function uid() { return Math.random().toString(36).slice(2) }

export const DAY_LABELS   = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const REST_OPTIONS = ['30s', '45s', '60s', '90s', '2 min', '3 min']

function ex(name, sets, reps, rest = '90s', repsType = 'reps', time = 30) {
  return { id: uid(), name, sets, repsType, reps, time, rest }
}

export const PPL_PLAN = {
  id: uid(),
  name: 'Push / Pull / Legs',
  active: true,
  days: [
    {
      id: uid(), label: 'Push',
      exercises: [
        ex('Bench Press',            4, 6,  '3 min'),
        ex('Overhead Press',         3, 8,  '2 min'),
        ex('Incline Dumbbell Press', 3, 10, '90s'),
        ex('Cable Lateral Raise',    3, 15, '60s'),
        ex('Tricep Pushdown',        3, 12, '60s'),
        ex('Overhead Tricep Ext.',   2, 15, '60s'),
      ],
    },
    {
      id: uid(), label: 'Pull',
      exercises: [
        ex('Deadlift',               3, 5,  '3 min'),
        ex('Barbell Row',            4, 8,  '2 min'),
        ex('Lat Pulldown',           3, 10, '90s'),
        ex('Cable Row',              3, 12, '90s'),
        ex('Face Pull',              3, 15, '60s'),
        ex('Dumbbell Curl',          3, 12, '60s'),
      ],
    },
    {
      id: uid(), label: 'Legs',
      exercises: [
        ex('Squat',                  4, 6,  '3 min'),
        ex('Romanian Deadlift',      3, 10, '2 min'),
        ex('Leg Press',              3, 12, '90s'),
        ex('Leg Curl',               3, 12, '90s'),
        ex('Leg Extension',          3, 15, '60s'),
        ex('Standing Calf Raise',    4, 15, '60s'),
      ],
    },
  ],
}

export function makeExercise() {
  return { id: uid(), name: '', sets: 3, repsType: 'reps', reps: 10, time: 30, rest: '60s' }
}

export function makeDay(index) {
  return { id: uid(), label: `Day ${DAY_LABELS[index] ?? index + 1}`, exercises: [] }
}

export function makePlan() {
  return { id: uid(), name: 'New plan', days: [makeDay(0)], active: false }
}

export function seedLogSets(exercises) {
  const result = {}
  exercises.forEach(ex => {
    result[ex.id] = Array.from({ length: ex.sets }, () => ({
      id: uid(), weight: '', amount: '', done: false,
    }))
  })
  return result
}