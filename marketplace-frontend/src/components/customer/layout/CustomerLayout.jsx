"use client"

import { useState, useEffect } from "react"
import useAuth from "../../../hooks/UseAuth"
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Home, 
  Package, 
  Star, 
  Heart, 
  Settings, 
  TrendingUp, 
  MessageSquare 
} from "lucide-react"
import customerService from "../../../services/customerService"

export default function CustomerLayout({ 
  children, 
  activeSection, 
  setActiveSection,
  onSearch
}) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchCartCount()
  }, [activeSection])

  const fetchCartCount = async () => {
    try {
      const response = await customerService.getCart()
      setCartCount(response.data?.totalItems || 0)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout()
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveSection("products")
      onSearch?.(searchQuery.trim())
      setSearchQuery("")
    }
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Browse Products", icon: Package },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "cart", label: "My Cart", icon: ShoppingCart },
    { id: "complaints", label: "My Complaints", icon: MessageSquare },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "followed", label: "Followed Sellers", icon: Heart },
    { id: "followed-feed", label: "Followed Feed", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: Settings },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && !e.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [profileDropdownOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <button
                onClick={() => setActiveSection("products")}
                className="text-xl font-bold text-blue-600 sm:text-2xl"
              >
                MarketPlace
              </button>
            </div>

            <div className="flex-1 hidden max-w-2xl mx-8 md:block">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setActiveSection("cart")
                  fetchCartCount()
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-600 rounded-full -top-1 -right-1">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="relative profile-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileDropdownOpen(!profileDropdownOpen)
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full">
                    <User size={16} />
                  </div>
                  <span className="hidden text-sm font-medium md:inline">
                    {user?.email}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 z-50 w-56 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Customer Account
                      </p>
                    </div>

                    <div className="py-2">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveSection(item.id)
                              setProfileDropdownOpen(false)
                              setSidebarOpen(false)
                            }}
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                          >
                            <Icon size={16} />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pb-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                placeholder="Search products..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        <div className="flex gap-4 lg:gap-6">
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } lg:block fixed lg:sticky top-20 left-0 w-64 bg-white rounded-lg shadow-sm p-4 z-40`}
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
