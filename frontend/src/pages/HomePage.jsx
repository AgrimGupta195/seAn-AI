import { Link } from 'react-router-dom';
import { Upload, Code, Zap, Sparkles, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-slate-200">
      <div className="text-center mb-16">
        <div className="inline-block bg-slate-900/70 border border-slate-700 rounded-2xl mb-6 px-8 py-4 shadow-lg shadow-indigo-900/40">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-linear-to-r from-indigo-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            SeAn AI
          </h1>
        </div>
        <p className="text-2xl sm:text-3xl text-slate-300/90 mb-4 font-light">
          Your Knowledge, Made Conversational
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Transform your videos, documents, and transcripts into an intelligent conversational AI that answers questions with precision and context.
        </p>
        {!user && (
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold px-10 py-4 rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-xl shadow-indigo-900/50 hover:shadow-indigo-800/70 transform hover:scale-105">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="border border-slate-700 text-slate-200 font-semibold px-10 py-4 rounded-xl hover:bg-slate-800/80 hover:border-slate-600 transition-all">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/60 transition-all hover:shadow-xl hover:shadow-indigo-900/30">
          <div className="bg-slate-800/90 w-16 h-16 rounded-xl flex items-center justify-center mb-4 ring-2 ring-indigo-500/40">
            <Upload className="text-indigo-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-3">Upload Content</h3>
          <p className="text-slate-400 leading-relaxed">
            Upload videos, documents, PDFs, and transcripts to build your personalized knowledge base
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 hover:border-violet-500/60 transition-all hover:shadow-xl hover:shadow-violet-900/30">
          <div className="bg-slate-800/90 w-16 h-16 rounded-xl flex items-center justify-center mb-4 ring-2 ring-violet-500/40">
            <Code className="text-violet-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-3">API Integration</h3>
          <p className="text-slate-400 leading-relaxed">
            Integrate SeAn AI into your website or application with a simple REST API call
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/60 transition-all hover:shadow-xl hover:shadow-indigo-900/30">
          <div className="bg-slate-800/90 w-16 h-16 rounded-xl flex items-center justify-center mb-4 ring-2 ring-indigo-500/40">
            <Zap className="text-indigo-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-3">Smart Learning</h3>
          <p className="text-slate-400 leading-relaxed">
            AI-powered RAG system delivers accurate, contextual responses with source citations
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
          <Clock className="text-indigo-300 mx-auto mb-3" size={32} />
          <h4 className="text-slate-100 font-bold mb-2">Video Timestamps</h4>
          <p className="text-slate-400 text-sm">Get exact timestamps where concepts are discussed</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
          <Shield className="text-violet-300 mx-auto mb-3" size={32} />
          <h4 className="text-slate-100 font-bold mb-2">Secure & Private</h4>
          <p className="text-slate-400 text-sm">Your data is encrypted and stored securely</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
          <Sparkles className="text-indigo-300 mx-auto mb-3" size={32} />
          <h4 className="text-slate-100 font-bold mb-2">Context-Aware</h4>
          <p className="text-slate-400 text-sm">Intelligent understanding of your content</p>
        </div>
      </div>

      {user && (
        <div className="text-center">
          <Link to="/upload">
            <button className="bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold px-10 py-4 rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-xl shadow-indigo-900/50 hover:shadow-indigo-800/70 transform hover:scale-105 mr-4">
              Upload Files
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="border border-slate-700 text-slate-200 font-semibold px-10 py-4 rounded-xl hover:bg-slate-800/80 hover:border-slate-600 transition-all">
              View API Docs
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
