import { FITNESS_GOALS } from './data'
import ChipToggle from './ChipToggle'
import Section from './Section'

export default function FitnessGoalsSection({ goals, toggle }) {
  return (
    <Section
      title="Fitness goals"
      description="Select up to 3 primary goals. These shape your workout and nutrition recommendations."
    >
      <div className="flex flex-wrap gap-2">
        {FITNESS_GOALS.map(goal => (
          <ChipToggle
            key={goal.slug}
            label={goal.label}
            selected={goals.includes(goal.slug)}
            onToggle={() => {
              if (!goals.includes(goal.slug) && goals.length >= 3) return
              toggle(goal.slug)
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{goals.length} / 3 selected</p>
    </Section>
  )
}
