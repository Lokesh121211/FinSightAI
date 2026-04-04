import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import { Menu, X } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-yellow-200 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-600"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <span className="font-bold text-gray-900">FinSight AI</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}