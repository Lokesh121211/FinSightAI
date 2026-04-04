import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const CATEGORIES = ['Food','Travel','Shopping','Bills','Health','Entertainment','Education','Miscellaneous']
const PAYMENT_MODES = ['Cash','Credit Card','Debit Card','UPI','Net Banking','Wallet']

export default function AddExpense() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [form, setForm] = useState({
    amount: '', category: 'Food', description: '',
    payment_mode: 'UPI', expense_date: new Date().toISOString().split('T')[0], notes: ''
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAutoCategorize = async () => {
    if (!form.description.trim()) { toast.error('Enter a description first'); return }
    setAiLoading(true)
    try {
      const res = await api.post('/ai/auto-categorize', { description: form.description })
      setForm({ ...form, category: res.data.category })
      toast.success(`AI suggested: ${res.data.category} (${(res.data.confidence * 100).toFixed(0)}% confident)`)
    } catch { toast.error('AI categorization failed') }
    finally { setAiLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/expenses/add', { ...form, amount: parseFloat(form.amount) })
      toast.success('Expense added!')
      navigate('/expenses')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add expense') }
    finally { setLoading(false) }
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
          <p className="text-gray-500 mt-1">Record a new transaction</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-yellow-200 shadow-lg shadow-yellow-50">
          <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-8 -mt-2"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange}
                placeholder="0.00" required min="0.01" step="0.01" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <div className="flex gap-2">
                <input type="text" name="description" value={form.description} onChange={handleChange}
                  placeholder="e.g. Swiggy dinner order" required className={`flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition`} />
                <button type="button" onClick={handleAutoCategorize} disabled={aiLoading}
                  className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-xl transition flex items-center gap-2 font-semibold whitespace-nowrap shadow-md shadow-yellow-100">
                  <Sparkles size={16} />
                  {aiLoading ? 'AI...' : 'AI Suggest'}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">Click "AI Suggest" to auto-detect category</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
              <select name="payment_mode" value={form.payment_mode} onChange={handleChange} className={inputClass}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input type="date" name="expense_date" value={form.expense_date} onChange={handleChange}
                required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes <span className="text-gray-400 font-normal">— optional</span>
              </label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="Any additional notes..." rows={3}
                className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/expenses')}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold rounded-xl transition shadow-md shadow-yellow-100">
                {loading ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}