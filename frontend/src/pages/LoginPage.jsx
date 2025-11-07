import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../lib/axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/user/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (error) {
      setError(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 backdrop-blur">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-900/40">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Welcome Back</h1>
        </div>
        <p className="text-xl sm:text-2xl font-semibold text-slate-300/90">to SeAn AI</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/70 border border-red-500/80 text-red-200 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 pr-12 w-full text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/70 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup">
            <span className="text-indigo-300 font-semibold hover:text-indigo-200 underline cursor-pointer transition-colors">
              Create Account
            </span>
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}

export default LoginPage;