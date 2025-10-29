import React from 'react'
import LoginPage from './pages/LoginPage'
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import Navbar from './components/Navbar'
import UploadPage from './pages/UploadPage'

const App = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <div className='bg-black flex-1 flex items-center justify-center pt-20 px-4'>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/upload' element={<UploadPage/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App