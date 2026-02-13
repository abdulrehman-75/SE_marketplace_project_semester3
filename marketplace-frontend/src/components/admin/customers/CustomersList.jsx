"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import CustomerFilters from "./CustomerFilters"
import CustomerDetails from "./CustomerDetails"

const CustomersList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    SearchTerm: "",
    City: "",
    IsActive: "",
    MinSpent: "",
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getCustomers(cleanFilters)
      if (response.data.success) {
        setCustomers(response.data.data.items)
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

  const handleViewDetails = async (customerId) => {
    try {
      setActionLoading(customerId)
      const response = await adminService.getCustomerById(customerId)
      if (response.data.success) {
        setSelectedCustomer(response.data.data)
        setShowDetails(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchCustomers, 0)
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers Management</h1>
        <Button onClick={fetchCustomers}>Refresh</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <CustomerFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchCustomers}
        onReset={() => {
          setFilters({ SearchTerm: "", City: "", IsActive: "", MinSpent: "", PageNumber: 1, PageSize: 10 })
          setTimeout(fetchCustomers, 0)
        }}
      />

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">City</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Total Spent</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{customer.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{customer.city || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{customer.totalOrders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    Rs. {customer.totalSpent?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(customer.customerId)}
                      disabled={actionLoading === customer.customerId}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {customers.length} of {pagination.totalCount} customers
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

      {showDetails && <CustomerDetails customer={selectedCustomer} onClose={() => setShowDetails(false)} />}
    </div>
  )
}

export default CustomersList
