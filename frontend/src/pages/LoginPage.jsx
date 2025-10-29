import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../lib/axios';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password,setPassword]= useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setLoading(true);
    try {
      axiosInstance.post('/user/login', { email, password });
      alert('Login successful');
    } catch (error) {
      alert('Login failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-900">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Welcome Back</h1>
        <p className="text-xl sm:text-2xl font-semibold text-gray-800">to seAn AI</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e)=>setEmail(e.target.value)}
            disabled={loading}
            className="border-2 border-gray-900 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              disabled={loading}
              className="border-2 border-gray-900 rounded-lg px-4 py-3 pr-12 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl mt-4 text-sm sm:text-base"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          Don't have an account?{' '}
          <Link to="/signup">
            <span className="text-black font-semibold underline cursor-pointer">
              Create Account
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;