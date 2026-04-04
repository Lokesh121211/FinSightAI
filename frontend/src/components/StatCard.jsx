import { motion } from 'framer-motion'

export default function StatCard({ title, value, subtitle, icon: Icon, color, delay = 0 }) {
  const colorMap = {
    gold:   'bg-yellow-100 text-yellow-600',
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-green-100 text-green-600',
    red:    'bg-red-100 text-red-500',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-500',
    pink:   'bg-pink-100 text-pink-500',
    teal:   'bg-teal-100 text-teal-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-all cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.gold}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  )
}