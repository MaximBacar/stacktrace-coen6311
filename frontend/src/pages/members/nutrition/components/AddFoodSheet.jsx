import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { uid, MEALS } from './data'

const EMPTY_FORM = { name: '', meal: 'Breakfast', calories: '', protein: '', carbs: '', fat: '' }

export default function AddFoodSheet({ open, onOpenChange, defaultMeal, onAdd }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, meal: defaultMeal ?? 'Breakfast' })

  function field(key) {
    return { value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.calories) return
    onAdd({
      id: uid(), meal: form.meal, name: form.name.trim(),
      calories: Number(form.calories) || 0, protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0,
    })
    setForm({ ...EMPTY_FORM, meal: form.meal })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col gap-6 pt-8 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log food</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Meal</Label>
            <div className="grid grid-cols-2 gap-2">
              {MEALS.map(m => (
                <button type="button" key={m}
                  onClick={() => setForm(f => ({ ...f, meal: m }))}
                  className={cn('py-2 rounded-lg border text-sm transition-colors',
                    form.meal === m ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}>{m}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="food-name" className="text-xs text-muted-foreground">Food name</Label>
            <Input id="food-name" placeholder="e.g. Chicken breast (150g)" required {...field('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="calories" className="text-xs text-muted-foreground">Calories (kcal)</Label>
              <Input id="calories" type="number" min={0} placeholder="0" required {...field('calories')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="protein" className="text-xs text-muted-foreground">Protein (g)</Label>
              <Input id="protein" type="number" min={0} placeholder="0" {...field('protein')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="carbs" className="text-xs text-muted-foreground">Carbs (g)</Label>
              <Input id="carbs" type="number" min={0} placeholder="0" {...field('carbs')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fat" className="text-xs text-muted-foreground">Fat (g)</Label>
              <Input id="fat" type="number" min={0} placeholder="0" {...field('fat')} />
            </div>
          </div>
          <Button type="submit" className="mt-2">Add food</Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
