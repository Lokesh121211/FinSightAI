import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', monthly_budget: user?.monthly_budget || '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/profile', { full_name: form.full_name, monthly_budget: parseFloat(form.monthly_budget) || 0 })
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"

  return (
    <PageTransition>
      <div className="max-w-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-500 mt-1">Manage your account settings</p>
        </div>

        {/* Avatar Card */}
        <div className="flex items-center gap-5 mb-6 p-6 bg-white rounded-2xl border border-yellow-200 shadow-sm">
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-yellow-100">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg">{user?.full_name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-gray-400 text-xs mt-1">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6 -mt-1"></div>
          <h3 className="text-gray-900 font-bold mb-5">Edit Details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" value={user?.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed" />
              <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Budget (₹)</label>
              <input type="number" value={form.monthly_budget} onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} placeholder="e.g. 30000" className={inputClass} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold rounded-xl transition shadow-md shadow-yellow-100">
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}