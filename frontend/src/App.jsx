import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegistrationPage from './pages/auth/registration/RegistrationPage'
import CoachDirectoryPage from './pages/coaches/CoachDirectoryPage'

export function App() {
  return (
    <div className='w-full w-screen'>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<CoachDirectoryPage />} />
          <Route path="/coaches" element={<CoachDirectoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}
