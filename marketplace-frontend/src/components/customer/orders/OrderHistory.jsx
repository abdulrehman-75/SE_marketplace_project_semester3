"use client"

import { useEffect, useState } from "react"
import { Package, Clock, Filter, X, ChevronLeft, ChevronRight } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function OrderHistory({
  onNavigate,
  onSelectOrder,
}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState(null)

  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const filters = {
        OrderStatus: orderStatus,
        PaymentStatus: paymentStatus,
        FromDate: fromDate,
        ToDate: toDate,
        PageNumber: currentPage,
        PageSize: 10,
      }

      const response = await customerService.getOrders(filters)
      setOrders(response.data.items)
      setPagination(response.data)
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchOrders()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setOrderStatus("")
    setPaymentStatus("")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
    fetchOrders()
  }

  const getOrderStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-indigo-100 text-indigo-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
      Disputed: "bg-orange-100 text-orange-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      VerificationPeriod: "bg-blue-100 text-blue-700",
      Confirmed: "bg-green-100 text-green-700",
      Released: "bg-green-100 text-green-700",
      Frozen: "bg-orange-100 text-orange-700",
      Disputed: "bg-red-100 text-red-700",
      Cancelled: "bg-gray-100 text-gray-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={() => setShowFilters(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Order Status</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="PickedUp">Picked Up</option>
                <option value="OnTheWay">On The Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="VerificationPeriod">Verification Period</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Released">Released</option>
                <option value="Frozen">Frozen</option>
                <option value="Disputed">Disputed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <Package size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No orders found</h3>
          <p className="mb-6 text-gray-600">Start shopping to see your orders here!</p>
          <Button onClick={() => onNavigate("products")}>Browse Products</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => onSelectOrder(order.orderId)}
                className="p-6 transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order #{order.orderId}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Clock size={14} />
                      {new Date(order.orderDate).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">Rs. {order.grandTotal.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{order.totalItems} item(s)</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                    Order: {order.orderStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <p><span className="font-medium">Delivery:</span> {order.deliveryAddress}, {order.deliveryCity}</p>
                  <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={!pagination.hasPrevious}>
                <ChevronLeft size={18} /> Previous
              </Button>

              <span className="text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <Button variant="outline" onClick={() => setCurrentPage(currentPage + 1)} disabled={!pagination.hasNext}>
                Next <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
