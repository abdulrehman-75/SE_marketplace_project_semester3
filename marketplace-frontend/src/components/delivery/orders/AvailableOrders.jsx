// components/delivery/orders/AvailableOrders.jsx
"use client"

import { useEffect, useState } from "react"
import { Search, MapPin, Package, DollarSign, Eye, Loader2, AlertCircle } from "lucide-react"
import deliveryStaffService from "../../../services/deliveryStaffService"

const AvailableOrders = ({ onSelectOrder }) => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)
  const [assigning, setAssigning] = useState(null)

  useEffect(() => {
    fetchAvailableOrders()
  }, [searchTerm, cityFilter, pageNumber])

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await deliveryStaffService.getAvailableOrders({
        SearchTerm: searchTerm || undefined,
        City: cityFilter || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })

      if (response.data) {
        setOrders(response.data.items || [])
        setTotalPages(response.data.totalPages || 0)
      } else {
        setOrders([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching available orders:", error)
      setError(error.message || "Failed to load available orders")
      setOrders([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignOrder = async (orderId) => {
    try {
      setAssigning(orderId)
      await deliveryStaffService.selfAssignOrder(orderId)
      alert("Order assigned successfully! Check 'My Deliveries' section.")
      fetchAvailableOrders()
    } catch (error) {
      console.error("Error assigning order:", error)
      alert(error.message || "Failed to assign order")
    } finally {
      setAssigning(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-white border border-red-200 rounded-lg">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="mb-2 text-lg font-semibold text-gray-900">Error Loading Orders</p>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={fetchAvailableOrders}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Available Orders</h2>
        <p className="text-gray-600">Find and assign orders for delivery</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">Order #{order.id}</span>
                    {order.isCOD && (
                      <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                        COD
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.deliveryCity || "N/A"}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">
                      ${order.grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-600">
                      Customer: <span className="font-medium text-gray-900">{order.customerName}</span>
                    </p>
                    {order.customerPhone && (
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => onSelectOrder(order.id)}
                    className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleAssignOrder(order.id)}
                    disabled={assigning === order.id}
                    className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {assigning === order.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign to Me"
                    )}
                  </button>
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
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="mb-4 text-lg font-semibold text-gray-900">No available orders</p>
          <p className="mb-4 text-gray-600">
            {searchTerm || cityFilter 
              ? "Try adjusting your filters" 
              : "Check back later for new delivery opportunities"}
          </p>
          <button
            onClick={fetchAvailableOrders}
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}

export default AvailableOrders