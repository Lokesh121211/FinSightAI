import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet,
  Receipt, Target, Trophy
} from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx'
import PageTransition from '../components/PageTransition.jsx'

const COLORS = ['#c9a227','#2196f3','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316']

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [summaryRes, chartsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/charts')
      ])
      setSummary(summaryRes.data)
      setCharts(chartsRes.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const pieData = charts?.pie_chart?.labels?.map((label, i) => ({
    name: label, value: charts.pie_chart.data[i]
  })) || []

  const lineData = charts?.line_chart?.labels?.map((label, i) => ({
    month: label, spent: charts.line_chart.data[i]
  })) || []

  const barData = charts?.bar_chart?.labels?.map((label, i) => ({
    month: label,
    Expenses: charts.bar_chart.expenses[i],
    Budget: charts.bar_chart.budget[i]
  })) || []

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Here's your financial overview for this month.
          </p>
        </motion.div>

        {/* Budget Alert */}
        {summary?.budget_used_percentage >= 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              summary.budget_used_percentage >= 100
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            <span className="text-xl flex-shrink-0">
              {summary.budget_used_percentage >= 100 ? '🚨' : '⚠️'}
            </span>
            <p className="font-medium text-sm">
              {summary.budget_used_percentage >= 100
                ? 'You have exceeded your monthly budget!'
                : `You have used ${summary.budget_used_percentage}% of your monthly budget.`}
            </p>
          </motion.div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              title="Total Spent"
              value={`₹${summary?.total_monthly_spending?.toLocaleString()}`}
              subtitle="This month"
              icon={TrendingUp}
              color="gold"
              delay={0.1}
            />
            <StatCard
              title="Remaining Budget"
              value={`₹${summary?.remaining_budget?.toLocaleString()}`}
              subtitle={`${summary?.budget_used_percentage}% used`}
              icon={Wallet}
              color="blue"
              delay={0.2}
            />
            <StatCard
              title="Savings"
              value={`${summary?.savings_percentage?.toFixed(1)}%`}
              subtitle="Of monthly budget"
              icon={Target}
              color="green"
              delay={0.3}
            />
            <StatCard
              title="Transactions"
              value={summary?.total_transactions}
              subtitle="This month"
              icon={Receipt}
              color="orange"
              delay={0.4}
            />
            <StatCard
              title="Top Category"
              value={summary?.top_category}
              subtitle="Highest spending"
              icon={Trophy}
              color="purple"
              delay={0.5}
            />
            <StatCard
              title="Monthly Budget"
              value={`₹${summary?.monthly_budget?.toLocaleString()}`}
              subtitle="Set budget"
              icon={TrendingDown}
              color="teal"
              delay={0.6}
            />
          </div>
        )}

        {/* Charts */}
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SkeletonChart /><SkeletonChart />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-gray-900 font-bold mb-4 text-sm sm:text-base">
                  Spending by Category
                </h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-gray-400">
                    <Receipt size={36} className="mb-2 opacity-30" />
                    <p className="text-sm">No expenses this month yet</p>
                  </div>
                )}
              </motion.div>

              {/* Line Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-gray-900 font-bold mb-4 text-sm sm:text-base">
                  Monthly Spending Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `₹${v/1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      stroke="#c9a227"
                      strokeWidth={2}
                      dot={{ fill: '#c9a227', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-gray-900 font-bold mb-4 text-sm sm:text-base">
                Budget vs Expenses (Last 6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `₹${v/1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="Budget" fill="#fde68a" radius={[4,4,0,0]} />
                  <Bar dataKey="Expenses" fill="#c9a227" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  )
}