import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import axiosInstance from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError('');

    try {
      const { data } = await axiosInstance.post('/chat', {
        message: currentInput,
        conversationHistory: messages,
      }, {
        headers: {
          'x-api-key': user?.apiKey || ''
        }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to get response. Please check your API key.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-screen bg-[#040714] text-slate-100">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Start a Conversation</h2>
              <p className="text-slate-400">Ask questions about your uploaded content</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white'
                    : msg.error
                    ? 'bg-red-900/80 text-white border border-red-700/70'
                    : 'bg-slate-900/80 text-slate-100 border border-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/70">
                    <p className="text-xs text-slate-400 mb-2">Sources:</p>
                    {msg.sources.map((source, i) => (
                      <div key={i} className="text-xs text-slate-300 mb-1">
                        {source.timestamp && (
                          <span className="text-indigo-300">📹 {source.timestamp}</span>
                        )}
                        {source.source && (
                          <span className="ml-2">📄 {source.source}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/80 text-white rounded-2xl p-4 border border-slate-800">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/80 text-white p-4 rounded-2xl border border-red-700/70">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-800/70 p-4 bg-[#040714]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your content..."
            disabled={loading}
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-900/40"
          >
            <Send size={20} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
