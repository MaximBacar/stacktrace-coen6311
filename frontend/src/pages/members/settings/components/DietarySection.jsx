import { DIETARY_OPTIONS } from './data'
import ChipToggle from './ChipToggle'
import Section from './Section'

export default function DietarySection({ dietary, toggle }) {
  return (
    <Section
      title="Dietary restrictions"
      description="Select everything that applies. Meal plans will be filtered accordingly."
    >
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map(opt => (
          <ChipToggle
            key={opt.slug}
            label={opt.label}
            selected={dietary.includes(opt.slug)}
            onToggle={() => toggle(opt.slug)}
          />
        ))}
      </div>
      {dietary.length === 0 && (
        <p className="text-xs text-muted-foreground">No restrictions selected — all foods included.</p>
      )}
    </Section>
  )
}
