import { BrowserRouter, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/auth/LoginPage'
import RegistrationPage from './pages/auth/registration/RegistrationPage'

export function App() {
  return (
    <div className='w-full w-screen'>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>hello world</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}
