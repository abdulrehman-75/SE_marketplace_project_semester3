// components/delivery/orders/MyDeliveries.jsx
"use client"

import { useEffect, useState } from "react"
import { Search, Eye, Loader2, AlertCircle } from "lucide-react"
import deliveryStaffService from "../../../services/deliveryStaffService"

const MyDeliveries = ({ onSelectDelivery }) => {
  const [loading, setLoading] = useState(true)
  const [deliveries, setDeliveries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyDeliveries()
  }, [searchTerm, statusFilter, cityFilter, pageNumber])

  const fetchMyDeliveries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await deliveryStaffService.getMyAssignedOrders({
        SearchTerm: searchTerm || undefined,
        OrderStatus: statusFilter || undefined,
        City: cityFilter || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })

      if (response.data) {
        setDeliveries(response.data.items || [])
        setTotalPages(response.data.totalPages || 0)
      } else {
        setDeliveries([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      setError(error.message || "Failed to load deliveries")
      setDeliveries([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-orange-100 text-orange-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700"
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
        <p className="mb-2 text-lg font-semibold text-gray-900">Error Loading Deliveries</p>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={fetchMyDeliveries}
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
        <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
        <p className="text-gray-600">Manage your assigned delivery orders</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="PickedUp">Picked Up</option>
            <option value="OnTheWay">On The Way</option>
            <option value="Delivered">Delivered</option>
          </select>
          <input
            type="text"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Deliveries Table */}
      {deliveries.length > 0 ? (
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
                      Delivery Address
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
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        #{delivery.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{delivery.customerName}</p>
                          <p className="text-gray-500">{delivery.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900">{delivery.deliveryCity}</p>
                          <p className="truncate">{delivery.deliveryAddress}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {delivery.totalItems}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ${delivery.grandTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.orderStatus)}`}>
                          {delivery.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onSelectDelivery(delivery.id)}
                          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Eye size={16} />
                          View
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
          <p className="text-lg font-semibold text-gray-900">No deliveries found</p>
          <p className="mt-2 text-gray-600">
            {searchTerm || statusFilter || cityFilter
              ? "Try adjusting your filters"
              : "Assign orders from the 'Available Orders' section"}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyDeliveries