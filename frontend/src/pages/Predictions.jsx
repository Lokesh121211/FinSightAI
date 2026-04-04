import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageTransition from '../components/PageTransition.jsx'

export default function Predictions() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPrediction() }, [])

  const fetchPrediction = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ai/predict-expense')
      setData(res.data)
    } catch { toast.error('Failed to load prediction') }
    finally { setLoading(false) }
  }

  const chartData = data?.historical_data?.map(d => ({
    month: d.month, amount: d.total, predicted: null
  })) || []

  if (chartData.length > 0 && data?.predicted_amount) {
    chartData.push({ month: data.prediction_month, amount: null, predicted: data.predicted_amount })
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-yellow-500" size={28} /> Expense Prediction
          </h2>
          <p className="text-gray-500 mt-1">ML-powered forecast based on your spending history</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Prediction Card */}
            <div className="bg-white rounded-2xl p-8 border-2 border-yellow-300 shadow-lg shadow-yellow-50">
              <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6 -mt-2"></div>
              <p className="text-gray-500 text-sm font-medium mb-1">Predicted Spending for</p>
              <p className="text-yellow-600 font-bold text-lg mb-3">{data?.prediction_month}</p>
              <p className="text-5xl font-bold text-gray-900">₹{data?.predicted_amount?.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-3">Based on last 6 months using Linear Regression</p>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
              <h3 className="text-gray-900 font-bold mb-6">Historical + Predicted Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip formatter={(value, name) => [`₹${value?.toLocaleString()}`, name === 'amount' ? 'Actual' : 'Predicted']}
                    contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="amount" stroke="#c9a227" strokeWidth={2} dot={{ fill: '#c9a227', r: 4 }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#2196f3" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#2196f3', r: 4 }} name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
              <h3 className="text-gray-900 font-bold mb-4">Monthly History</h3>
              <div className="space-y-2">
                {data?.historical_data?.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-yellow-50 last:border-0">
                    <span className="text-gray-500 text-sm">{d.month}</span>
                    <span className="text-gray-900 font-bold">₹{d.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}