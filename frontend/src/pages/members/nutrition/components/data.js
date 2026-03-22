export const GOALS = { calories: 2200, protein: 150, carbs: 240, fat: 73 }
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export const TODAY_PLAN = [
  { meal: 'Breakfast', items: [
    { name: 'Overnight oats',      calories: 380, protein: 14, carbs: 58, fat: 9 },
    { name: 'Greek yogurt (200g)', calories: 130, protein: 18, carbs: 8,  fat: 2 },
  ]},
  { meal: 'Lunch', items: [
    { name: 'Grilled chicken breast (180g)', calories: 295, protein: 55, carbs: 0,  fat: 6 },
    { name: 'Brown rice (150g cooked)',       calories: 165, protein: 4,  carbs: 34, fat: 1 },
    { name: 'Steamed broccoli',               calories: 55,  protein: 4,  carbs: 10, fat: 0 },
  ]},
  { meal: 'Dinner', items: [
    { name: 'Salmon fillet (200g)', calories: 412, protein: 40, carbs: 0,  fat: 26 },
    { name: 'Sweet potato mash',    calories: 180, protein: 3,  carbs: 38, fat: 2  },
    { name: 'Mixed greens salad',   calories: 45,  protein: 2,  carbs: 7,  fat: 1  },
  ]},
  { meal: 'Snacks', items: [
    { name: 'Whey protein shake',       calories: 140, protein: 25, carbs: 5, fat: 2  },
    { name: 'Handful of almonds (30g)', calories: 173, protein: 6,  carbs: 5, fat: 15 },
  ]},
]

export const INITIAL_LOG = [
  { id: '1', meal: 'Breakfast', name: 'Overnight oats',               calories: 380, protein: 14, carbs: 58, fat: 9 },
  { id: '2', meal: 'Breakfast', name: 'Greek yogurt (200g)',           calories: 130, protein: 18, carbs: 8,  fat: 2 },
  { id: '3', meal: 'Lunch',     name: 'Grilled chicken breast (180g)', calories: 295, protein: 55, carbs: 0,  fat: 6 },
  { id: '4', meal: 'Lunch',     name: 'Brown rice (150g cooked)',      calories: 165, protein: 4,  carbs: 34, fat: 1 },
]

export function uid() { return Math.random().toString(36).slice(2) }
