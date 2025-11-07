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
        <div className="flex-1 w-full">
          <div className='max-w-7xl mx-auto w-full pt-24 pb-12 px-4 sm:px-6 lg:px-8'>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/signup' element={<SignupPage />} />
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
                    <DashboardPage/>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App