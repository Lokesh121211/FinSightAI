import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { PlusCircle, Search, Trash2, Pencil, Download, Receipt } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'

const CATEGORIES = ['All','Food','Travel','Shopping','Bills','Health','Entertainment','Education','Miscellaneous']

const CATEGORY_COLORS = {
  Food: 'bg-orange-100 text-orange-600',
  Travel: 'bg-blue-100 text-blue-600',
  Shopping: 'bg-pink-100 text-pink-600',
  Bills: 'bg-red-100 text-red-500',
  Health: 'bg-green-100 text-green-600',
  Entertainment: 'bg-purple-100 text-purple-600',
  Education: 'bg-yellow-100 text-yellow-700',
  Miscellaneous: 'bg-gray-100 text-gray-600',
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { fetchExpenses() }, [search, category])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      const res = await api.get('/expenses', { params })
      setExpenses(res.data)
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Deleted!')
      fetchExpenses()
    } catch { toast.error('Failed to delete') }
  }

  const startEdit = (expense) => {
    setEditingId(expense.expense_id)
    setEditForm({ amount: expense.amount, description: expense.description, category: expense.category, payment_mode: expense.payment_mode, expense_date: expense.expense_date })
  }

  const handleEditSave = async (id) => {
    try {
      await api.put(`/expenses/${id}`, { ...editForm, amount: parseFloat(editForm.amount) })
      toast.success('Updated!')
      setEditingId(null)
      fetchExpenses()
    } catch { toast.error('Failed to update') }
  }

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/expenses/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = 'expenses.csv'; a.click()
      toast.success('CSV downloaded!')
    } catch { toast.error('Export failed') }
  }

  const inputClass = "bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm px-3 py-1.5 focus:outline-none focus:border-yellow-400"

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
            <p className="text-gray-500 mt-1">{expenses.length} transactions found</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-yellow-200 transition text-sm font-medium shadow-sm">
              <Download size={16} /> Export CSV
            </button>
            <Link to="/add-expense"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition text-sm font-semibold shadow-md shadow-yellow-100">
              <PlusCircle size={16} /> Add New
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search expenses..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-yellow-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 text-sm shadow-sm"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-yellow-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400 text-sm shadow-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-30" />
              <p>No expenses found</p>
              <Link to="/add-expense" className="text-yellow-600 hover:text-yellow-700 text-sm mt-2 inline-block font-medium">
                Add your first expense →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-100 bg-yellow-50">
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Date</th>
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Description</th>
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Category</th>
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Payment</th>
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Amount</th>
                    <th className="px-6 py-4 text-gray-600 text-xs font-bold uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-50">
                  {expenses.map((expense) => (
                    <tr key={expense.expense_id} className="hover:bg-yellow-50 transition">
                      {editingId === expense.expense_id ? (
                        <>
                          <td className="px-6 py-3"><input type="date" value={editForm.expense_date} onChange={(e) => setEditForm({ ...editForm, expense_date: e.target.value })} className={inputClass} /></td>
                          <td className="px-6 py-3"><input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`${inputClass} w-full`} /></td>
                          <td className="px-6 py-3">
                            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputClass}>
                              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-3"><input type="text" value={editForm.payment_mode} onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value })} className={`${inputClass} w-24`} /></td>
                          <td className="px-6 py-3"><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className={`${inputClass} w-24`} /></td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditSave(expense.expense_id)} className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-gray-500 text-sm">{expense.expense_date}</td>
                          <td className="px-6 py-4 text-gray-900 text-sm font-medium">{expense.description}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-600'}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{expense.payment_mode}</td>
                          <td className="px-6 py-4 text-gray-900 font-bold">₹{expense.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(expense)} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"><Pencil size={15} /></button>
                              <button onClick={() => handleDelete(expense.expense_id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}