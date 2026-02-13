"use client"

import { useEffect, useState } from "react"
import { Search, AlertTriangle, Phone, Mail } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const StockAlerts = ({ onSelectProduct }) => {
  const [loading, setLoading] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState([])
  const [alerts, setAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchCriticalAlerts()
    fetchAlerts()
  }, [searchTerm, priorityFilter, pageNumber])

  const fetchCriticalAlerts = async () => {
    try {
      const response = await inventoryService.getCriticalAlerts()
      setCriticalAlerts(response.data || [])
    } catch (error) {
      console.error("Error fetching critical alerts:", error)
    }
  }

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getLowStockAlerts({
        SearchTerm: searchTerm || undefined,
        Priority: priorityFilter || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })
      setAlerts(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 0)
    } catch (error) {
      console.error("Error fetching alerts:", error)
      alert(error.message || "Failed to load alerts")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stock Alerts</h2>
        <p className="text-gray-600">Monitor and manage low stock alerts</p>
      </div>

      {/* Critical Alerts Section */}
      {criticalAlerts.length > 0 && (
        <div className="p-6 border-2 border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-900">Critical Alerts ({criticalAlerts.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {criticalAlerts.slice(0, 6).map((alert) => (
              <div
                key={alert.productId}
                className="p-4 transition-shadow bg-white border-2 border-red-300 rounded-lg cursor-pointer hover:shadow-md"
                onClick={() => onSelectProduct(alert.productId)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{alert.productName}</h4>
                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                    {alert.priority}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <strong>Current Stock:</strong> {alert.currentStock} / {alert.lowStockThreshold}
                  </p>
                  <p className="text-red-600">
                    <strong>Deficit:</strong> {alert.stockDeficit} units short
                  </p>
                  <p className="text-gray-600">
                    <strong>Seller:</strong> {alert.sellerShopName}
                  </p>
                  <p className="text-xs text-gray-500">{alert.daysSinceLastRestock} days since last restock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* All Alerts */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : alerts.length > 0 ? (
        <>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.productId}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(alert.priority)}`}
                onClick={() => onSelectProduct(alert.productId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(alert.priority)}`}
                      >
                        {alert.priority}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.productName}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Stock</p>
                        <p className="text-xl font-bold text-gray-900">{alert.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Threshold</p>
                        <p className="text-xl font-bold text-gray-900">{alert.lowStockThreshold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deficit</p>
                        <p className="text-xl font-bold text-red-600">{alert.stockDeficit} units</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Category: {alert.categoryName}</span>
                      <span>{alert.daysSinceLastRestock} days since restock</span>
                    </div>
                  </div>

                  <div className="ml-6 p-4 bg-gray-50 rounded-lg min-w-[200px]">
                    <p className="mb-2 text-sm font-semibold text-gray-900">Seller Contact</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{alert.sellerShopName}</p>
                      <a
                        href={`mailto:${alert.sellerEmail}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail size={14} />
                        {alert.sellerEmail}
                      </a>
                      {alert.sellerPhone && (
                        <a
                          href={`tel:${alert.sellerPhone}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone size={14} />
                          {alert.sellerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pageNumber} of {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-lg">
          <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No stock alerts</p>
          <p className="mt-2 text-sm text-gray-500">All products are well stocked!</p>
        </div>
      )}
    </div>
  )
}

export default StockAlerts