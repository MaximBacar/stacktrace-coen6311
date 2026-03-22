export function uid() { return Math.random().toString(36).slice(2) }

export const DAY_LABELS   = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const REST_OPTIONS = ['30s', '45s', '60s', '90s', '2 min', '3 min']

export function seedLogSets(exercises) {
  const result = {}
  exercises.forEach(ex => {
    result[ex.id] = Array.from({ length: ex.sets }, () => ({
      id: uid(), weight: '', amount: '', done: false,
    }))
  })
  return result
}

const REST_TO_SECONDS = { '30s': 30, '45s': 45, '60s': 60, '90s': 90, '2 min': 120, '3 min': 180 }
const SECONDS_TO_REST = Object.fromEntries(Object.entries(REST_TO_SECONDS).map(([k, v]) => [v, k]))

export function restToSeconds(label) { return REST_TO_SECONDS[label] ?? 60 }
export function secondsToRest(s)     { return SECONDS_TO_REST[s] ?? '60s' }

export function normalizeExercise(ex) {
  return {
    id:         ex.id,
    name:       ex.name,
    sets:       ex.sets,
    repsType:   ex.duration != null ? 'time' : 'reps',
    reps:       ex.reps     ?? 10,
    time:       ex.duration ?? 30,
    rest:       secondsToRest(ex.rest_time),
    orderIndex: ex.order_index,
  }
}

export function normalizeDay(day) {
  return {
    id:        day.id,
    label:     day.name,
    exercises: (day.exercises ?? []).map(normalizeExercise),
  }
}

export function normalizePlan(plan) {
  return {
    id:        plan.id,
    name:      plan.name,
    days:      (plan.days ?? []).map(normalizeDay),
    createdBy: plan.created_by ?? { type: 'self' },
  }
}