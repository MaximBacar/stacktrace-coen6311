import { BrowserRouter, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/auth/LoginPage'

export function App() {
  return (
    <div className='w-full w-screen'>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>hello world</div>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}
