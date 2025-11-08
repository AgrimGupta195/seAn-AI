import { useState } from 'react';
import { Copy, Check, Code, Book, Key, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  const apiKey = user?.apiKey || 'YOUR_API_KEY';
  // Use environment variable or default to production API endpoint
  const baseUrl = import.meta.env.VITE_API_BASE_URL 
    ? (import.meta.env.VITE_API_BASE_URL.startsWith('http') 
        ? import.meta.env.VITE_API_BASE_URL 
        : `${window.location.origin}${import.meta.env.VITE_API_BASE_URL}`)
    : 'https://seanai-backend-skk0.onrender.com/api';

  const codeExamples = {
    javascript: `// Using Fetch API
fetch('${baseUrl}/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({
    message: 'What did you learn from the uploaded files?'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Answer:', data.answer);
  console.log('Sources:', data.sources);
})
.catch(error => console.error('Error:', error));`,

    curl: `curl -X POST ${baseUrl}/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "message": "What did you learn from the uploaded files?"
  }'`,

    python: `import requests

url = "${baseUrl}/chat"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
}
data = {
    "message": "What did you learn from the uploaded files?"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print("Answer:", result["answer"])
print("Sources:", result["sources"])`,

    react: `import { useState } from 'react';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const sendMessage = async () => {
    const res = await fetch('${baseUrl}/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}'
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <div>
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
      />
      <button onClick={sendMessage}>Send</button>
      {response && <div>{response.answer}</div>}
    </div>
  );
}`
  };

  const [selectedExample, setSelectedExample] = useState('javascript');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-slate-200">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">API Dashboard</h1>
        <p className="text-slate-400">Integrate SeAn AI into your website or application</p>
      </div>

      {/* API Key Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg shadow-indigo-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Key className="text-indigo-300" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Your API Key</h2>
        </div>
        <p className="text-slate-400 mb-4 text-sm">
          Use this key to authenticate your API requests. Keep it secure and never share it publicly.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 font-mono text-sm break-all">
            {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
          </code>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-4 py-3 bg-slate-800 text-slate-100 rounded-lg hover:bg-slate-700 transition-all"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => copyToClipboard(apiKey, 'apikey')}
            className="px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all flex items-center gap-2 shadow shadow-indigo-900/40"
          >
            {copied.apikey ? <Check size={20} /> : <Copy size={20} />}
            Copy
          </button>
        </div>
      </div>

      {/* API Endpoint */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg shadow-indigo-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Code className="text-indigo-300" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">API Endpoint</h2>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 font-mono text-sm">
            POST {baseUrl}/chat
          </code>
          <button
            onClick={() => copyToClipboard(`${baseUrl}/chat`, 'endpoint')}
            className="px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all flex items-center gap-2 shadow shadow-indigo-900/40"
          >
            {copied.endpoint ? <Check size={20} /> : <Copy size={20} />}
            Copy
          </button>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg shadow-indigo-900/20">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Request Format</h2>
        <div className="bg-slate-950/80 border border-slate-700 rounded-lg p-4 mb-4">
          <p className="text-slate-400 text-sm mb-2">Headers:</p>
          <code className="text-emerald-400 text-sm">
            x-api-key: {apiKey.substring(0, 10)}...
          </code>
          <br />
          <code className="text-emerald-400 text-sm">
            Content-Type: application/json
          </code>
        </div>
        <div className="bg-slate-950/80 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">Body:</p>
          <pre className="text-emerald-400 text-sm overflow-x-auto">
{`{
  "message": "Your question here"
}`}
          </pre>
        </div>
      </div>

      {/* Response Format */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg shadow-indigo-900/20">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Response Format</h2>
        <div className="bg-slate-950/80 border border-slate-700 rounded-lg p-4">
          <pre className="text-emerald-400 text-sm overflow-x-auto">
{`{
  "answer": "The AI's response to your question",
  "sources": [
    {
      "text": "Relevant text excerpt...",
      "timestamp": "00:05:23",
      "source": "filename.pdf",
      "score": 0.95
    }
  ]
}`}
          </pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-lg shadow-indigo-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Book className="text-indigo-300" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Code Examples</h2>
        </div>
        
        {/* Language Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-700">
          {['javascript', 'python', 'curl', 'react'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedExample(lang)}
              className={`px-4 py-2 font-semibold transition-all ${
                selectedExample === lang
                  ? 'text-slate-100 border-b-2 border-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        {/* Code Display */}
        <div className="bg-slate-950/80 border border-slate-700 rounded-lg p-4 relative">
          <button
            onClick={() => copyToClipboard(codeExamples[selectedExample], 'code')}
            className="absolute top-2 right-2 px-3 py-1 bg-slate-800 text-slate-100 rounded hover:bg-slate-700 transition-all flex items-center gap-2 text-sm"
          >
            {copied.code ? <Check size={16} /> : <Copy size={16} />}
            Copy
          </button>
          <pre className="text-emerald-400 text-sm overflow-x-auto pr-16">
            <code>{codeExamples[selectedExample]}</code>
          </pre>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <h3 className="text-slate-100 font-bold mb-2">📹 Video Timestamps</h3>
          <p className="text-slate-400 text-sm">
            Get exact timestamps where concepts are discussed in your videos
          </p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <h3 className="text-slate-100 font-bold mb-2">📚 Multi-Source</h3>
          <p className="text-slate-400 text-sm">
            Search across PDFs, documents, videos, and transcripts simultaneously
          </p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <h3 className="text-slate-100 font-bold mb-2">🎯 Context-Aware</h3>
          <p className="text-slate-400 text-sm">
            RAG-powered responses with source citations and relevance scores
          </p>
        </div>
      </div>
    </div>
  );
}
