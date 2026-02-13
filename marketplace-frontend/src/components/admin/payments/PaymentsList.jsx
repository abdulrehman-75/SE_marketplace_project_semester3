"use client"

import { useEffect, useState } from "react"
import { CreditCard } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import PaymentFilters from "./PaymentFilters"
import PaymentActionModal from "./PaymentActionModal"

const PaymentsList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    Status: "",
    SellerId: "",
    IsDisputed: "",
    IsExpired: "",
    FromDate: "",
    ToDate: "",
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getPayments(cleanFilters)
      if (response.data.success) {
        setPayments(response.data.data.items)
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

  const handleTakeAction = (payment) => {
    setSelectedPayment(payment)
    setShowActionModal(true)
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchPayments, 0)
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      VerificationPeriod: "bg-blue-100 text-blue-700",
      Confirmed: "bg-green-100 text-green-700",
      Released: "bg-green-100 text-green-700",
      Frozen: "bg-red-100 text-red-700",
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
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <Button onClick={fetchPayments}>Refresh</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <PaymentFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchPayments}
        onReset={() => {
          setFilters({
            Status: "",
            SellerId: "",
            IsDisputed: "",
            IsExpired: "",
            FromDate: "",
            ToDate: "",
            PageNumber: 1,
            PageSize: 10,
          })
          setTimeout(fetchPayments, 0)
        }}
      />

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Seller</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Days Left</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.verificationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">#{payment.verificationId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">#{payment.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{payment.sellerShopName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    Rs. {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${payment.daysRemaining <= 2 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {payment.daysRemaining} days
                    </span>
                    {payment.isExpired && <span className="ml-2 text-xs text-red-600">(Expired)</span>}
                    {payment.isDisputed && <span className="ml-2 text-xs text-red-600">(Disputed)</span>}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleTakeAction(payment)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <CreditCard className="w-4 h-4" />
                      Take Action
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
              Showing {payments.length} of {pagination.totalCount} payments
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

      {showActionModal && (
        <PaymentActionModal
          payment={selectedPayment}
          onClose={() => setShowActionModal(false)}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  )
}

export default PaymentsList
