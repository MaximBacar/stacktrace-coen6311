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
            key={goal}
            label={goal}
            selected={goals.includes(goal)}
            onToggle={() => {
              if (!goals.includes(goal) && goals.length >= 3) return
              toggle(goal)
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{goals.length} / 3 selected</p>
    </Section>
  )
}