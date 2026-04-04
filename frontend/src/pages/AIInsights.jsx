import { useState, useEffect, useRef } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Brain, RefreshCw, Send, User, Bot, Crown, Home, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageTransition from '../components/PageTransition.jsx'

const LIFESTYLES = [
  { key: 'basic', label: 'Basic', icon: Home, color: 'bg-green-100 text-green-700 border-green-300', activeColor: 'bg-green-500 text-white border-green-500', desc: '~₹10,000/mo' },
  { key: 'middle', label: 'Middle Class', icon: Briefcase, color: 'bg-blue-100 text-blue-700 border-blue-300', activeColor: 'bg-blue-500 text-white border-blue-500', desc: '~₹34,000/mo' },
  { key: 'rich', label: 'Rich', icon: Crown, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', activeColor: 'bg-yellow-500 text-white border-yellow-500', desc: '~₹1,65,000/mo' },
]

export default function AIInsights() {
  const [insights, setInsights] = useState([])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  // Chat state
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm FinSight AI 👋 Ask me anything about your finances!" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Lifestyle comparison state
  const [selectedLifestyle, setSelectedLifestyle] = useState(null)
  const [lifestyleData, setLifestyleData] = useState(null)
  const [lifestyleLoading, setLifestyleLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [insightsRes, alertRes] = await Promise.all([
        api.get('/ai/insights'),
        api.get('/ai/budget-alert')
      ])
      setInsights(insightsRes.data.insights)
      setAlert(alertRes.data)
    } catch { toast.error('Failed to load insights') }
    finally { setLoading(false) }
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const res = await api.post('/gemini/chat', { message: userMsg })
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Please try again!" }])
    } finally { setChatLoading(false) }
  }

  const handleLifestyleCompare = async (lifestyle) => {
    setSelectedLifestyle(lifestyle)
    setLifestyleLoading(true)
    try {
      const res = await api.post('/gemini/lifestyle-compare', { lifestyle })
      setLifestyleData(res.data)
    } catch { toast.error('Failed to compare lifestyle') }
    finally { setLifestyleLoading(false) }
  }

  const getBarColor = (status) => {
    if (status === 'over') return '#ef4444'
    if (status === 'under') return '#10b981'
    return '#c9a227'
  }

  return (
    <PageTransition>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="text-yellow-500" size={28} /> AI Insights
            </h2>
            <p className="text-gray-500 mt-1">Smart analysis + AI chat + lifestyle comparison</p>
          </div>
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-yellow-200 transition text-sm font-medium shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-6">

              {/* Budget Status */}
              {alert && (
                <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
                  <h3 className="text-gray-900 font-bold mb-5">Budget Status</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div><p className="text-gray-400 text-xs mb-1">Total Spent</p><p className="text-xl font-bold text-gray-900">₹{alert.total_spent?.toLocaleString()}</p></div>
                    <div><p className="text-gray-400 text-xs mb-1">Budget</p><p className="text-xl font-bold text-gray-900">₹{alert.budget?.toLocaleString()}</p></div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Used</p>
                      <p className={`text-xl font-bold ${alert.percentage_used >= 100 ? 'text-red-500' : alert.percentage_used >= 80 ? 'text-yellow-600' : 'text-green-500'}`}>
                        {alert.percentage_used}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-500 ${alert.percentage_used >= 100 ? 'bg-red-500' : alert.percentage_used >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(alert.percentage_used, 100)}%` }}></div>
                  </div>
                  {alert.alerts?.map((a, i) => (
                    <div key={i} className={`mt-3 p-3 rounded-xl border text-sm font-medium ${
                      a.type === 'danger' ? 'bg-red-50 border-red-200 text-red-600' :
                      a.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-blue-50 border-blue-200 text-blue-600'}`}>
                      {a.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Smart Insights */}
              <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-5">Smart Insights</h3>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <span className="text-lg">{insight.slice(0, 2)}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{insight.slice(2).trim()}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Comparison */}
              <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-2">Lifestyle Comparison</h3>
                <p className="text-gray-400 text-sm mb-5">Compare your spending with different lifestyles</p>

                {/* Lifestyle Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {LIFESTYLES.map(({ key, label, icon: Icon, color, activeColor, desc }) => (
                    <button key={key}
                      onClick={() => handleLifestyleCompare(key)}
                      disabled={lifestyleLoading}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                        selectedLifestyle === key ? activeColor : color
                      } hover:scale-105 disabled:opacity-50`}>
                      <Icon size={22} />
                      <span className="text-sm">{label}</span>
                      <span className="text-xs opacity-70">{desc}</span>
                    </button>
                  ))}
                </div>

                {/* Lifestyle Results */}
                {lifestyleLoading && (
                  <div className="flex items-center justify-center h-20">
                    <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {lifestyleData && !lifestyleLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs mb-1">Your Spending</p>
                        <p className="text-gray-900 font-bold">₹{lifestyleData.your_total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs mb-1">{lifestyleData.lifestyle_label}</p>
                        <p className="text-yellow-700 font-bold">₹{lifestyleData.benchmark_total?.toLocaleString()}</p>
                      </div>
                      <div className={`rounded-xl p-3 text-center ${lifestyleData.difference > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-gray-400 text-xs mb-1">Difference</p>
                        <p className={`font-bold ${lifestyleData.difference > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {lifestyleData.difference > 0 ? '+' : ''}₹{lifestyleData.difference?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* AI Insight */}
                    {lifestyleData.ai_insight && (
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-gray-700 text-sm leading-relaxed">🤖 {lifestyleData.ai_insight}</p>
                      </div>
                    )}

                    {/* Category Chart */}
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={lifestyleData.comparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                        <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                        <YAxis type="category" dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, '']}
                          contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="your_spending" name="Your Spending" radius={[0,4,4,0]}>
                          {lifestyleData.comparison?.map((entry, i) => (
                            <Cell key={i} fill={getBarColor(entry.status)} />
                          ))}
                        </Bar>
                        <Bar dataKey="benchmark" fill="#d1d5db" name="Benchmark" radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span>Over benchmark</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block"></span>Under benchmark</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block"></span>Benchmark</span>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN - AI Chat */}
            <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm flex flex-col" style={{ height: '700px' }}>
              <div className="p-5 border-b border-yellow-100">
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4 -mt-1"></div>
                <h3 className="text-gray-900 font-bold flex items-center gap-2">
                  <Bot size={20} className="text-yellow-500" /> Chat with FinSight AI
                </h3>
                <p className="text-gray-400 text-xs mt-1">Ask anything about your finances</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-yellow-500' : 'bg-gray-100'}`}>
                        {msg.role === 'user'
                          ? <User size={16} className="text-white" />
                          : <Bot size={16} className="text-yellow-500" />}
                      </div>
                      <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-yellow-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot size={16} className="text-yellow-500" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-yellow-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask about your spending, savings..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition text-sm"
                  />
                  <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-200 text-white rounded-xl transition">
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['How am I doing this month?', 'Where can I save money?', 'Am I overspending?'].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }}
                      className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </PageTransition>
  )
}