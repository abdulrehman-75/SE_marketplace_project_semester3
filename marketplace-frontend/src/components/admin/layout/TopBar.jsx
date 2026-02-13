"use client"

import { Menu, LogOut } from "lucide-react"
import useAuth from "../../../hooks/useAuth" // ✅ FIXED: Use your existing hook

const TopBar = ({ isSidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 transition-colors rounded-lg hover:bg-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {user?.actorInfo?.displayName || user?.email || "Admin"}
        </h2>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </header>
  )
}

export default TopBar