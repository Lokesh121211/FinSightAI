import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', monthly_budget: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/register', { ...form, monthly_budget: parseFloat(form.monthly_budget) || 0 })
      login(res.data.user, res.data.access_token)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-200">
            <Wallet size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FinSight AI</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl p-8 border border-yellow-200 shadow-xl shadow-yellow-100">

          <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-8 -mt-2"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Budget (₹) <span className="text-gray-400 font-normal">— optional</span>
              </label>
              <input type="number" value={form.monthly_budget}
                onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })}
                placeholder="e.g. 30000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold rounded-xl transition-all duration-200 shadow-md shadow-yellow-200 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}