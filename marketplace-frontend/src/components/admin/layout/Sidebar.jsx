"use client"

import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  CreditCard,
  Package,
  FolderTree,
  Star,
  UserCog,
  MessageSquare,
  BarChart3,
  Settings,
  UserPlus, // ✅ NEW ICON
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const Sidebar = ({ isOpen, setIsOpen, activeSection, setActiveSection }) => {
  const [staffMenuOpen, setStaffMenuOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sellers", label: "Sellers Management", icon: Store },
    { id: "customers", label: "Customers Management", icon: Users },
    { id: "orders", label: "Orders Management", icon: ShoppingCart },
    { id: "payments", label: "Payments Management", icon: CreditCard },
    { id: "products", label: "Products Management", icon: Package },
    { id: "categories", label: "Categories Management", icon: FolderTree },
    { id: "reviews", label: "Reviews Moderation", icon: Star },
    {
      id: "staff",
      label: "Staff Management",
      icon: UserCog,
      hasSubmenu: true,
      submenu: [
        { id: "staff-delivery", label: "Delivery Staff" },
        { id: "staff-support", label: "Support Staff" },
        { id: "staff-inventory", label: "Inventory Managers" },
      ],
    },
    { id: "register-staff", label: "Register Staff", icon: UserPlus }, // ✅ NEW MENU ITEM
    { id: "complaints", label: "Complaints", icon: MessageSquare },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "config", label: "System Configuration", icon: Settings },
  ]

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setStaffMenuOpen(!staffMenuOpen)
    } else {
      setActiveSection(item.id)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${!isOpen && "lg:w-0 lg:overflow-hidden"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-blue-600 border-b border-gray-200">
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive =
                activeSection === item.id || (item.submenu && item.submenu.some((sub) => sub.id === activeSection))

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`
                      w-full flex items-center px-6 py-3 text-sm
                      transition-colors duration-150
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.hasSubmenu &&
                      (staffMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>

                  {item.hasSubmenu && staffMenuOpen && (
                    <div className="bg-gray-50">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveSection(subItem.id)}
                          className={`
                            w-full flex items-center px-12 py-2 text-sm
                            transition-colors duration-150
                            ${
                              activeSection === subItem.id
                                ? "bg-blue-100 text-blue-600"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                          `}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar