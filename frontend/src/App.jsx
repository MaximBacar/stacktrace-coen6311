import { useContext } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthContext, AuthProvider } from './context/AuthContext'
import { PublicRoute, ProtectedRoute, RoleRoute } from './components/ProtectedRoute'

import LoginPage        from './pages/auth/LoginPage'
import RegistrationPage from './pages/auth/registration/RegistrationPage'

import HomePage          from './pages/members/homepage/HomePage'
import WorkoutsPage      from './pages/members/workouts/WorkoutsPage'
import NutritionPage     from './pages/members/nutrition/NutritionPage'
import ProfilePage       from './pages/members/settings/ProfilePage'
import SettingsPage      from './pages/members/settings/SettingsPage'
import CoachingPage      from './pages/members/coaching/CoachingPage'
import FaqPage           from './pages/members/faq/FaqPage'
import MemberLayout      from './layouts/MemberLayout'

import CoachLayout       from './layouts/CoachLayout'
import DashboardPage     from './pages/coaches/DashboardPage'
import RequestsPage      from './pages/coaches/RequestsPage'
import ClientsPage       from './pages/coaches/ClientsPage'
import CalendarPage      from './pages/coaches/calendar/CalendarPage'
import CoachSettingsPage from './pages/coaches/CoachSettingsPage'
import CoachWorkoutsPage from './pages/coaches/CoachWorkoutsPage'

import AdminLayout          from './layouts/AdminLayout'
import AdminDashboardPage   from './pages/admins/DashboardPage'
import PoliciesPage         from './pages/admins/PoliciesPage'
import EquipmentPage        from './pages/admins/EquipmentPage'
import AdminMembersPage     from './pages/admins/MembersPage'
import StaffPage            from './pages/admins/StaffPage'
import AnalyticsPage        from './pages/admins/AnalyticsPage'
import GymPage              from './pages/admins/GymPage'
import AdminSettingsPage    from './pages/admins/AdminSettingsPage'

// Role-aware layout: picks the right sidebar nav based on role
function AppLayout() {
  const { user } = useContext(AuthContext)
  if (user?.role === 'admin')  return <AdminLayout />
  if (user?.role === 'coach')  return <CoachLayout />
  return <MemberLayout />
}

function RoleIndex()    {
  const { user } = useContext(AuthContext)
  if (user?.role === 'admin') return <AdminDashboardPage />
  if (user?.role === 'coach') return <DashboardPage />
  return <HomePage />
}
function RoleWorkouts() { const { user } = useContext(AuthContext); return user?.role === 'coach' ? <CoachWorkoutsPage /> : <WorkoutsPage />  }
function RoleSettings() {
  const { user } = useContext(AuthContext)
  if (user?.role === 'admin') return <AdminSettingsPage />
  if (user?.role === 'coach') return <CoachSettingsPage />
  return <SettingsPage />
}

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
              <Route element={<AppLayout />}>

                {/* Shared paths — role-aware, no guards needed */}
                <Route index            element={<RoleIndex />}    />
                <Route path="/workouts" element={<RoleWorkouts />} />
                <Route path="/settings" element={<RoleSettings />} />

                {/* Member-only paths — coaches get redirected to role home */}
                <Route element={<RoleRoute role="member" />}>
                  <Route path="/coaching"  element={<CoachingPage />}  />
                  <Route path="/nutrition" element={<NutritionPage />} />
                  <Route path="/faq"       element={<FaqPage />}       />
                  <Route path="/profile"   element={<ProfilePage />}   />
                </Route>

                {/* Coach-only paths — members/admins get redirected to role home */}
                <Route element={<RoleRoute role="coach" />}>
                  <Route path="/requests" element={<RequestsPage />} />
                  <Route path="/clients"  element={<ClientsPage />}  />
                  <Route path="/calendar" element={<CalendarPage />} />
                </Route>

                {/* Admin-only paths */}
                <Route element={<RoleRoute role="admin" />}>
                  <Route path="/policies"  element={<PoliciesPage />}      />
                  <Route path="/equipment" element={<EquipmentPage />}     />
                  <Route path="/members"   element={<AdminMembersPage />}  />
                  <Route path="/staff"     element={<StaffPage />}         />
                  <Route path="/analytics" element={<AnalyticsPage />}     />
                  <Route path="/gym"       element={<GymPage />}           />
                </Route>

              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}