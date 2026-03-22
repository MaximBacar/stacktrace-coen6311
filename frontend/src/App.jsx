import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute, ProtectedRoute, RoleRoute } from './components/ProtectedRoute'

import LoginPage        from './pages/auth/LoginPage'
import RegistrationPage from './pages/auth/registration/RegistrationPage'

import HomePage          from './pages/members/homepage/HomePage'
import WorkoutsPage      from './pages/members/workouts/WorkoutsPage'
import NutritionPage     from './pages/members/nutrition/NutritionPage'
import SettingsPage      from './pages/members/settings/SettingsPage'
import CoachingPage      from './pages/members/coaching/CoachingPage'
import MemberLayout      from './layouts/MemberLayout'

import CoachLayout       from './layouts/CoachLayout'
import DashboardPage     from './pages/coaches/DashboardPage'
import RequestsPage      from './pages/coaches/RequestsPage'
import ClientsPage       from './pages/coaches/ClientsPage'
import CalendarPage      from './pages/coaches/CalendarPage'
import CoachSettingsPage from './pages/coaches/CoachSettingsPage'

export function App() {
  return (
    <div className='w-full h-full min-h-0'>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>

              <Route element={<RoleRoute role="member" />}>
                <Route element={<MemberLayout />}>
                  <Route index           element={<HomePage />}     />
                  <Route path="/workouts"  element={<WorkoutsPage />}  />
                  <Route path="/coaching"  element={<CoachingPage />}  />
                  <Route path="/nutrition" element={<NutritionPage />} />
                  <Route path="/settings"  element={<SettingsPage />}  />
                </Route>
              </Route>

              <Route element={<RoleRoute role="coach" />}>
                <Route element={<CoachLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />}     />
                  <Route path="/requests"  element={<RequestsPage />}      />
                  <Route path="/clients"   element={<ClientsPage />}       />
                  <Route path="/calendar"  element={<CalendarPage />}      />
                  <Route path="/settings"  element={<CoachSettingsPage />} />
                </Route>
              </Route>

            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}
