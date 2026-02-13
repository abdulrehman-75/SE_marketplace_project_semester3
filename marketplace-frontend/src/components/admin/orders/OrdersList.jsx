"use client"

import { useEffect, useState } from "react"
import { Eye, CheckCircle } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import OrderFilters from "./OrderFilters"
import OrderDetails from "./OrderDetails"

const OrdersList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    CustomerId: "",
    SellerId: "",
    OrderStatus: "",
    PaymentStatus: "",
    FromDate: "",
    ToDate: "",
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getOrders(cleanFilters)
      if (response.data.success) {
        setOrders(response.data.data.items)
        setPagination({
          pageNumber: response.data.data.pageNumber,
          pageSize: response.data.data.pageSize,
          totalCount: response.data.data.totalCount,
          totalPages: response.data.data.totalPages,
          hasPrevious: response.data.data.hasPrevious,
          hasNext: response.data.data.hasNext,
        })
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (orderId) => {
    try {
      setActionLoading(orderId)
      const response = await adminService.getOrderById(orderId)
      if (response.data.success) {
        setSelectedOrder(response.data.data)
        setShowDetails(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmOrder = async (orderId) => {
    if (!confirm("Are you sure you want to confirm this order on behalf of the seller?")) return

    try {
      setActionLoading(orderId)
      const response = await adminService.confirmOrder(orderId, {
        reason: "Admin confirmation - seller not responding",
        notifySellers: true,
        notifyCustomer: true,
      })
      if (response.data.success) {
        fetchOrders()
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchOrders, 0)
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-indigo-100 text-indigo-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
      Disputed: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <Button onClick={fetchOrders}>Refresh</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <OrderFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchOrders}
        onReset={() => {
          setFilters({
            CustomerId: "",
            SellerId: "",
            OrderStatus: "",
            PaymentStatus: "",
            FromDate: "",
            ToDate: "",
            PageNumber: 1,
            PageSize: 10,
          })
          setTimeout(fetchOrders, 0)
        }}
      />

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order Status</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">#{order.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-gray-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    Rs. {order.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order.orderId)}
                        disabled={actionLoading === order.orderId}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.orderStatus === "Pending" && (
                        <button
                          onClick={() => handleConfirmOrder(order.orderId)}
                          disabled={actionLoading === order.orderId}
                          className="text-green-600 hover:text-green-800"
                          title="Confirm Order"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {orders.length} of {pagination.totalCount} orders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPrevious}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.pageNumber} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showDetails && <OrderDetails order={selectedOrder} onClose={() => setShowDetails(false)} />}
    </div>
  )
}

export default OrdersList
