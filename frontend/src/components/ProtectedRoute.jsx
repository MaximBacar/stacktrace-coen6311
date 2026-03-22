import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'

/** Redirects unauthenticated users to /login */
export function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

/** Redirects authenticated users away from auth pages to / */
export function PublicRoute() {
  const { isAuthenticated } = useContext(AuthContext)
  return isAuthenticated ? <Navigate to="/workouts" replace /> : <Outlet />
}
