"use client"

import { Users, ShoppingCart, Package, FileText } from "lucide-react"

const QuickActions = ({ onNavigate }) => {
  const actions = [
    { id: "sellers", label: "Manage Sellers", icon: Users, color: "bg-blue-600" },
    { id: "orders", label: "View Orders", icon: ShoppingCart, color: "bg-green-600" },
    { id: "products", label: "Manage Products", icon: Package, color: "bg-purple-600" },
    { id: "reports", label: "Generate Reports", icon: FileText, color: "bg-yellow-600" },
  ]

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="flex flex-col items-center gap-2 p-4 transition-all border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50"
            >
              <div className={`p-3 rounded-full ${action.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
