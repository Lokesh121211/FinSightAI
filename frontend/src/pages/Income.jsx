import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const INCOME_SOURCES = ['Salary','Freelance','Business','Investment','Rental','Gift','Bonus','Other']

export default function Income() {
  const [incomes, setIncomes] = useState([])
  const [netWorth, setNetWorth] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    amount: '', source: 'Salary', description: '',
    income_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [incomesRes, netWorthRes, monthlyRes] = await Promise.all([
        api.get('/income'),
        api.get('/income/net-worth'),
        api.get('/income/monthly-comparison')
      ])
      setIncomes(incomesRes.data)
      setNetWorth(netWorthRes.data)
      setMonthlyData(monthlyRes.data)
    } catch { toast.error('Failed to load income data') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/income/add', { ...form, amount: parseFloat(form.amount) })
      toast.success('Income added!')
      setShowForm(false)
      setForm({ amount: '', source: 'Salary', description: '', income_date: new Date().toISOString().split('T')[0] })
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add income') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return
    try {
      await api.delete(`/income/${id}`)
      toast.success('Deleted!')
      fetchAll()
    } catch { toast.error('Failed to delete') }
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition text-sm"

  return (
    <PageTransition>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Income & Savings</h2>
            <p className="text-gray-500 mt-1">Track your income and monitor net worth</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition shadow-md shadow-yellow-100">
            <PlusCircle size={18} />
            Add Income
          </button>
        </div>

        {/* Add Income Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6 -mt-1"></div>
            <h3 className="text-gray-900 font-bold mb-5">Add New Income</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" required min="0.01" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}>
                  {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Monthly salary" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })}
                  required className={inputClass} />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition shadow-md shadow-yellow-100">
                  Save Income
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Net Worth Cards */}
        {netWorth && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { title: 'Total Income', value: `₹${netWorth.total_income?.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
              { title: 'Total Expenses', value: `₹${netWorth.total_expenses?.toLocaleString()}`, icon: TrendingDown, color: 'bg-red-100 text-red-500' },
              { title: 'Net Worth', value: `₹${netWorth.net_worth?.toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
              { title: 'Savings Rate', value: `${netWorth.savings_rate?.toFixed(1)}%`, icon: PiggyBank, color: 'bg-blue-100 text-blue-600' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon size={18} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Monthly Chart */}
        <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
          <h3 className="text-gray-900 font-bold mb-6">Income vs Expenses (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, '']}
                contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '12px' }} />
              <Legend formatter={(value) => <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{value}</span>} />
              <Bar dataKey="income" fill="#c9a227" radius={[6,6,0,0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6,6,0,0]} name="Expenses" />
              <Bar dataKey="savings" fill="#10b981" radius={[6,6,0,0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income History */}
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50">
            <h3 className="text-gray-900 font-bold">Income History</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
              <p>No income entries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-yellow-50">
              {incomes.map((income) => (
                <div key={income.income_id} className="flex items-center justify-between px-6 py-4 hover:bg-yellow-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{income.source}</p>
                      <p className="text-gray-400 text-xs">{income.description || income.income_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-green-600 font-bold">+₹{income.amount?.toLocaleString()}</p>
                    <button onClick={() => handleDelete(income.income_id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  )
}