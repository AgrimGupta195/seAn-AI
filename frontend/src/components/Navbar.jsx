import React, { useState } from 'react'
import { Upload, LogOut, Menu, X, Home, Book } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-[#050d1a]/85 border-b border-slate-800 fixed inset-x-0 top-0 px-4 md:px-6 py-3 backdrop-blur-xl shadow-lg z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-400 transition-all">
          SeAn AI
        </Link>
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link to="/">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-800/80 hover:text-white transition-all text-sm">
              <Home size={18}/>
              <span>Home</span>
            </button>
          </Link>
          {user && (
            <>
              <Link to="/upload">
                <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all text-sm shadow-lg shadow-indigo-900/50">
                  <Upload size={18}/>
                  <span>Upload</span>
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-800/80 hover:text-white transition-all text-sm">
                  <Book size={18}/>
                  <span>Docs</span>
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/60 text-red-400 font-semibold rounded-lg hover:bg-red-900/30 transition-all text-sm"
              >
                <LogOut size={18}/>
                <span>Logout</span>
              </button>
            </>
          )}
          {!user && (
            <Link to="/login">
              <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all text-sm shadow-lg shadow-indigo-900/50">
                Login
              </button>
            </Link>
          )}
        </div>
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all">
                <Home size={20}/>
                <span>Home</span>
              </button>
            </Link>
            {user && (
              <>
                <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all">
                    <Upload size={20}/>
                    <span>Upload</span>
                  </button>
                </Link>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center gap-2 px-4 py-3 border border-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-800/80 transition-all">
                    <Book size={20}/>
                    <span>Documentation</span>
                  </button>
                </Link>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-3 border border-red-500/60 text-red-400 font-semibold rounded-lg hover:bg-red-900/30 transition-all"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={20}/>
                  <span>Logout</span>
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar;