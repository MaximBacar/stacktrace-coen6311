import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthContext } from '@/context/AuthContext'
import { fetchAccount, updateAccount } from '@/lib/api'
import { spring, fadeUp, stagger } from './components/animations'
import PhotoSection from './components/PhotoSection'
import PersonalInfoSection from './components/PersonalInfoSection'

export default function SettingsPage() {
  const { logout } = useContext(AuthContext)
  const navigate   = useNavigate()
  const queryClient = useQueryClient()

  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [dob,        setDob]        = useState('')
  const [gender,     setGender]     = useState('')
  const [avatarB64,  setAvatarB64]  = useState('')

  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn:  fetchAccount,
  })

  // Populate form when data arrives
  useEffect(() => {
    if (!account) return
    setFirstName(account.first_name ?? '')
    setLastName(account.last_name  ?? '')
    setEmail(account.email         ?? '')
    setDob(account.dob             ?? '')
    setGender(account.gender       ?? '')
    setAvatarB64(account.avatar_b64 ?? '')
  }, [account])

  const mutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: (data) => {
      queryClient.setQueryData(['account'], data)
    },
  })

  function handleSave(e) {
    e.preventDefault()
    mutation.mutate({ first_name: firstName, last_name: lastName, email, dob, gender, avatar_b64: avatarB64 })
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?'
  const saved = mutation.isSuccess

  return (
    <motion.div className="w-full h-full min-h-0" variants={stagger()} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and photo.</p>
      </motion.div>

      <form onSubmit={handleSave} className="h-full min-h-0 w-full flex flex-col">
        <div className="h-full min-h-0 divide-y flex flex-col overflow-y-scroll px-6 pb-20">
          <PhotoSection
            initials={initials}
            avatarB64={avatarB64}
            onAvatarChange={setAvatarB64}
          />

          <PersonalInfoSection
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName}   setLastName={setLastName}
            email={email}         setEmail={setEmail}
            dob={dob}             setDob={setDob}
            gender={gender}       setGender={setGender}
          />

          <div className="py-8">
            <h2 className="text-sm font-medium mb-1">Danger zone</h2>
            <p className="text-xs text-muted-foreground mb-4">Log out of your account on this device.</p>
            <Button type="button" variant="outline" className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/5" onClick={handleLogout}>
              <LogOut size={14} strokeWidth={2} />
              Log out
            </Button>
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          className="px-6 sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/80 backdrop-blur-sm py-4 mt-4"
        >
          <p className="text-xs text-muted-foreground">
            {mutation.isError ? 'Failed to save. Please try again.' : 'Changes are saved to your account.'}
          </p>
          <motion.div animate={saved ? { scale: [1, 0.97, 1] } : {}} transition={spring}>
            <Button type="submit" className="gap-2 min-w-28" disabled={mutation.isPending}>
              {saved ? <><Check size={14} strokeWidth={2.5} /> Saved</> : mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}
