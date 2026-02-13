// components/seller/orders/OrdersManagement.jsx
"use client"

import { useEffect, useState } from "react"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import sellerService from "../../../services/sellerService"

const OrdersManagement = ({ onSelectOrder }) => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, statusFilter, paymentFilter, pageNumber])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await sellerService.getOrders({
        SearchTerm: searchTerm || undefined,
        OrderStatus: statusFilter || undefined,
        PaymentStatus: paymentFilter || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })

      console.log("Orders API Response:", response)

      // ✅ FIXED: Handle different response structures
      if (response.data) {
        // If response.data has items property (paginated)
        if (response.data.items) {
          setOrders(Array.isArray(response.data.items) ? response.data.items : [])
          setTotalPages(response.data.totalPages || 0)
        } 
        // If response.data is directly an array
        else if (Array.isArray(response.data)) {
          setOrders(response.data)
          setTotalPages(1)
        }
        // If response.data is the paginated object itself
        else {
          setOrders([])
          setTotalPages(0)
        }
      } else {
        setOrders([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(error.message || "Failed to load orders")
      setOrders([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      Confirmed: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Cancelled: "bg-red-100 text-red-700",
      Delivered: "bg-blue-100 text-blue-700",
      Shipped: "bg-purple-100 text-purple-700",
      Processing: "bg-orange-100 text-orange-700"
    }
    return statusMap[status] || "bg-gray-100 text-gray-700"
  }

  const getPaymentColor = (status) => {
    const statusMap = {
      Paid: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Failed: "bg-red-100 text-red-700",
      Refunded: "bg-purple-100 text-purple-700"
    }
    return statusMap[status] || "bg-gray-100 text-gray-700"
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
          onClick={fetchOrders}
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
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-600">Manage your customer orders</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length > 0 ? (
        <>
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {order.customerName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {order.totalItems || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.paymentStatus)}`}
                        >
                          {order.paymentStatus || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold text-gray-900">No orders found</p>
          <p className="mt-2 text-gray-600">
            {searchTerm || statusFilter || paymentFilter
              ? "Try adjusting your filters"
              : "Orders will appear here once customers place them"}
          </p>
        </div>
      )}
    </div>
  )
}

export default OrdersManagement