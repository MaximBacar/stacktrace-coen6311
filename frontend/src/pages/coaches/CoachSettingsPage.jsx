import { useAuth } from '@/hooks/useAuth'

export default function CoachSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8 px-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your coach profile and preferences.</p>
      </div>

      <div className="rounded-xl border divide-y">
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Account</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user?.id ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{user?.role ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Profile</p>
          <p className="text-sm text-muted-foreground">Profile editing coming soon.</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Availability</p>
          <p className="text-sm text-muted-foreground">Manage your open time slots here.</p>
        </div>
      </div>
    </div>
  )
}
