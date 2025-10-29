import React, { useState } from 'react'
import { Upload, Settings, LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axios';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async ()=>{
    try{
      await axiosInstance.post('/user/logout');
      alert('Logout successful');
    }catch(error){
      alert('Logout failed');
    }
  }

  return (
    <div className="bg-black border-b fixed w-full border-white px-4 md:px-6 py-4 backdrop-blur-2xl shadow-lg z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className='text-2xl md:text-3xl font-bold text-white'>seAn AI</h1>
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link to="/upload">
          <button className="flex cursor-pointer items-center gap-2 px-3 lg:px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm lg:text-base">
            <Upload size={20}/>
            <span>Upload</span>
          </button>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex cursor-pointer items-center gap-2 px-3 lg:px-4 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all text-sm lg:text-base"
            >
              <Settings size={20}/>
              <span>Settings</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-xl z-50">
                <button 
                  className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-black font-semibold hover:bg-gray-100 transition-all rounded-lg"
                  onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                  }}
                >
                  <LogOut size={20}/>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white pt-4">
          <div className="flex flex-col gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all">
              <Upload size={20}/>
              <span>Upload</span>
            </button>
            
            <button 
              className="flex items-center gap-2 px-4 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Settings size={20}/>
              <span>Settings</span>
            </button>

            {isDropdownOpen && (
              <button 
                className="flex items-center gap-2 px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all ml-4"
                onClick={() => {
                  console.log('Logging out...');
                  setIsDropdownOpen(false);
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={20}/>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar