import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ACTIVITY_LEVELS } from './data'
import Field from './Field'
import Section from './Section'

export default function BodyMetricsSection({
  heightUnit, setHeightUnit,
  heightCm,   setHeightCm,
  heightFt,   setHeightFt,
  heightIn,   setHeightIn,
  weightUnit, setWeightUnit,
  weight,     setWeight,
  activity,   setActivity,
}) {
  return (
    <Section
      title="Body metrics"
      description="Used to calculate TDEE, macro targets, and progress tracking."
    >
      <Field label="Height">
        <div className="flex gap-2 items-start">
          <div className="flex rounded-lg border overflow-hidden h-10 shrink-0">
            {['cm', 'ft'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setHeightUnit(u)}
                className={cn(
                  'px-3 text-xs transition-colors',
                  heightUnit === u ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {u}
              </button>
            ))}
          </div>

          {heightUnit === 'cm' ? (
            <Input
              type="number" min={100} max={250} placeholder="178"
              value={heightCm} onChange={e => setHeightCm(e.target.value)}
              className="w-28"
            />
          ) : (
            <div className="flex gap-2">
              <Input
                type="number" min={4} max={8} placeholder="5"
                value={heightFt} onChange={e => setHeightFt(e.target.value)}
                className="w-20"
              />
              <span className="self-center text-xs text-muted-foreground">ft</span>
              <Input
                type="number" min={0} max={11} placeholder="11"
                value={heightIn} onChange={e => setHeightIn(e.target.value)}
                className="w-20"
              />
              <span className="self-center text-xs text-muted-foreground">in</span>
            </div>
          )}
        </div>
      </Field>

      <Field label="Weight">
        <div className="flex gap-2 items-center">
          <div className="flex rounded-lg border overflow-hidden h-10 shrink-0">
            {['kg', 'lbs'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={cn(
                  'px-3 text-xs transition-colors',
                  weightUnit === u ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {u}
              </button>
            ))}
          </div>
          <Input
            type="number" min={30} max={300}
            placeholder={weightUnit === 'kg' ? '74' : '163'}
            value={weight} onChange={e => setWeight(e.target.value)}
            className="w-28"
          />
        </div>
      </Field>

      <Field label="Activity level" hint="Used to estimate your daily calorie needs.">
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVELS.map(lvl => (
            <button
              key={lvl.value}
              type="button"
              onClick={() => setActivity(lvl.value)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors',
                activity === lvl.value ? 'bg-foreground text-background border-foreground' : 'hover:bg-muted/40'
              )}
            >
              <span className={cn('text-sm font-medium', activity === lvl.value ? 'text-background' : '')}>{lvl.label}</span>
              <span className={cn('text-xs', activity === lvl.value ? 'text-background/70' : 'text-muted-foreground')}>{lvl.sub}</span>
            </button>
          ))}
        </div>
      </Field>
    </Section>
  )
}