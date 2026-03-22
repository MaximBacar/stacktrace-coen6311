import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { spring, fadeUp, stagger } from './components/animations'
import PhotoSection from './components/PhotoSection'
import PersonalInfoSection from './components/PersonalInfoSection'
import BodyMetricsSection from './components/BodyMetricsSection'
import DietarySection from './components/DietarySection'
import FitnessGoalsSection from './components/FitnessGoalsSection'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  // personal info
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [dob,       setDob]       = useState('')
  const [gender,    setGender]    = useState('')

  // body metrics
  const [heightUnit, setHeightUnit] = useState('cm')
  const [heightCm,   setHeightCm]   = useState('')
  const [heightFt,   setHeightFt]   = useState('')
  const [heightIn,   setHeightIn]   = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [weight,     setWeight]     = useState('')
  const [activity,   setActivity]   = useState('')

  // dietary & goals
  const [dietary, setDietary] = useState([])
  const [goals,   setGoals]   = useState([])

  function toggleSet(setter, value) {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?'

  return (
    <motion.div className="w-full h-full min-h-0" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and preferences.</p>
      </motion.div>

      <form onSubmit={handleSave} className="h-full min-h-0 w-full flex flex-col">
        <div className="h-full min-h-0 divide-y flex flex-col overflow-y-scroll px-6 pb-20">
          <PhotoSection initials={initials} />

          <PersonalInfoSection
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName}   setLastName={setLastName}
            email={email}         setEmail={setEmail}
            dob={dob}             setDob={setDob}
            gender={gender}       setGender={setGender}
          />

          <BodyMetricsSection
            heightUnit={heightUnit} setHeightUnit={setHeightUnit}
            heightCm={heightCm}     setHeightCm={setHeightCm}
            heightFt={heightFt}     setHeightFt={setHeightFt}
            heightIn={heightIn}     setHeightIn={setHeightIn}
            weightUnit={weightUnit} setWeightUnit={setWeightUnit}
            weight={weight}         setWeight={setWeight}
            activity={activity}     setActivity={setActivity}
          />

          <DietarySection
            dietary={dietary}
            toggle={value => toggleSet(setDietary, value)}
          />

          <FitnessGoalsSection
            goals={goals}
            toggle={value => toggleSet(setGoals, value)}
          />
        </div>

        <motion.div
          variants={fadeUp}
          className="px-6 sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/80 backdrop-blur-sm py-4 mt-4"
        >
          <p className="text-xs text-muted-foreground">Changes are saved to your account.</p>
          <motion.div animate={saved ? { scale: [1, 0.97, 1] } : {}} transition={spring}>
            <Button type="submit" className="gap-2 min-w-28">
              {saved ? <><Check size={14} strokeWidth={2.5} /> Saved</> : 'Save changes'}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}