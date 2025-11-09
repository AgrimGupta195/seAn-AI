import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Navbar from './components/Navbar'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <div className='flex flex-col min-h-screen bg-[#040714] text-slate-100 transition-colors duration-300'>
        <Navbar/>
        <main className="flex-1 w-full">
          <Routes>
            <Route path='/' element={<div className='max-w-7xl mx-auto w-full pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8'><HomePage /></div>} />
            <Route path='/login' element={<div className='max-w-7xl mx-auto w-full pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8'><LoginPage /></div>} />
            <Route path='/signup' element={<div className='max-w-7xl mx-auto w-full pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8'><SignupPage /></div>} />
            <Route 
              path='/upload' 
              element={
                <ProtectedRoute>
                  <UploadPage/>
                </ProtectedRoute>
              }
            />
            <Route 
              path='/dashboard' 
              element={
                <ProtectedRoute>
                  <div className='max-w-7xl mx-auto w-full pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8'><DashboardPage/></div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App