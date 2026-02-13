// components/supportStaff/SupportStaffLayout.jsx
"use client"

import React, { useState, useEffect } from "react"
import { LayoutDashboard, AlertCircle, User, LogOut, Menu, X, BarChart3 } from "lucide-react"
import useAuth from "../../hooks/UseAuth"

const SupportStaffLayout = ({ activeSection, setActiveSection, children }) => {
  const { logout, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [activeSection])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "complaints", label: "Complaints", icon: AlertCircle },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ]

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logout()
      } catch (error) {
        console.error("Logout error:", error)
      }
    }
  }

  const handleMenuClick = (itemId) => {
    setActiveSection(itemId)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Support Staff Portal</h1>
              <p className="hidden text-xs text-gray-500 sm:block">Manage customer complaints & support</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || "Support Staff"}</p>
              <p className="text-xs text-gray-500">{user?.email || "Support Account"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white border-r border-gray-200
            w-64 transform transition-transform duration-300 ease-in-out z-30
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <nav className="h-full p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id || 
                              (item.id === "complaints" && ["complaint-detail"].includes(activeSection))
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default SupportStaffLayout