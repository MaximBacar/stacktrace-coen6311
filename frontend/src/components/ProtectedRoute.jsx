import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'

const ROLE_HOME = {
  member: '/workouts',
  coach:  '/dashboard',
  admin:  '/',
}

/** Redirects unauthenticated users to /login */
export function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

/** Redirects authenticated users away from auth pages to their role's home */
export function PublicRoute() {
  const { isAuthenticated, user } = useContext(AuthContext)
  if (!isAuthenticated) return <Outlet />
  return <Navigate to={ROLE_HOME[user?.role] ?? '/'} replace />
}

/** Allows only users with the given role; redirects others to their own home */
export function RoleRoute({ role }) {
  const { user } = useContext(AuthContext)
  if (user?.role === role) return <Outlet />
  return <Navigate to={ROLE_HOME[user?.role] ?? '/login'} replace />
}
