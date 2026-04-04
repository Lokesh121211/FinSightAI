import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import AddExpense from './pages/AddExpense.jsx'
import AIInsights from './pages/AIInsights.jsx'
import Predictions from './pages/Predictions.jsx'
import Profile from './pages/Profile.jsx'
import Income from './pages/Income.jsx'

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
        <Route path="/add-expense" element={<ProtectedRoute><Layout><AddExpense /></Layout></ProtectedRoute>} />
        <Route path="/income" element={<ProtectedRoute><Layout><Income /></Layout></ProtectedRoute>} />
        <Route path="/ai-insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
        <Route path="/predictions" element={<ProtectedRoute><Layout><Predictions /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}