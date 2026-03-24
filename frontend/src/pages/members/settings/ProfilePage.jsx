import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { spring, fadeUp, stagger } from './components/animations'
import BodyMetricsSection from './components/BodyMetricsSection'
import DietarySection from './components/DietarySection'
import FitnessGoalsSection from './components/FitnessGoalsSection'

export default function ProfilePage() {
  const [saved, setSaved] = useState(false)

  const [heightUnit, setHeightUnit] = useState('cm')
  const [heightCm,   setHeightCm]   = useState('')
  const [heightFt,   setHeightFt]   = useState('')
  const [heightIn,   setHeightIn]   = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [weight,     setWeight]     = useState('')
  const [activity,   setActivity]   = useState('')

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

  return (
    <motion.div className="w-full h-full min-h-0" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Fitness Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your body metrics, dietary restrictions, and fitness goals.</p>
      </motion.div>

      <form onSubmit={handleSave} className="h-full min-h-0 w-full flex flex-col">
        <div className="h-full min-h-0 divide-y flex flex-col overflow-y-scroll px-6 pb-20">
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
