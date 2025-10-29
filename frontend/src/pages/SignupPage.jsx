import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../lib/axios';
export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async() => {
    setLoading(true);
    if(password !== confirmPassword) {
    alert('Passwords do not match');
    setLoading(false);
    return;
  }
    try {
      const{data}=await axiosInstance.post('/user/signup', { fullName, email, password });
      alert('Signup successful');
      console.log(data);
    } catch (error) {
      alert('Signup failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-900">
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-1">Create Account</h1>
        <p className="text-xl sm:text-2xl font-semibold text-gray-800">Join seAn AI</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            placeholder="Enter your name"
            className="border-2 border-gray-900 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="border-2 border-gray-900 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="border-2 border-gray-900 rounded-lg px-4 py-2.5 pr-12 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="border-2 border-gray-900 rounded-lg px-4 py-2.5 pr-12 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl mt-2 text-sm sm:text-base"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          Already have an account?{' '}
          <Link to="/login">
            <span className="text-black font-semibold underline cursor-pointer">
              Sign In
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}