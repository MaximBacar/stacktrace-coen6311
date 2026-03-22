import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GENDERS } from './data'
import Field from './Field'
import Section from './Section'

export default function PersonalInfoSection({
  firstName, setFirstName,
  lastName,  setLastName,
  email,     setEmail,
  dob,       setDob,
  gender,    setGender,
}) {
  return (
    <Section
      title="Personal information"
      description="Used to personalise your experience and calculate nutritional targets."
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name">
          <Input placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </Field>
        <Field label="Last name">
          <Input placeholder="Mercer" value={lastName} onChange={e => setLastName(e.target.value)} />
        </Field>
      </div>

      <Field label="Email">
        <Input
          type="email"
          placeholder="alex@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth">
          <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
        </Field>
        <Field label="Gender">
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={cn(
                  'py-2 px-3 rounded-lg border text-xs text-left transition-colors',
                  gender === g
                    ? 'bg-foreground text-background border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Section>
  )
}
