"use client"

import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Plus } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import SellerFilters from "./SellerFilters"
import SellerDetails from "./SellerDetails"
import SellerStatusModal from "./SellerStatusModal" // ✅ NEW IMPORT
import CreateSellerForm from "./CreateSellerForm"

const SellersList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sellers, setSellers] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    SearchTerm: "",
    City: "",
    IsActive: "",
    IsVerified: "",
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false) // ✅ NEW STATE
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getSellers(cleanFilters)
      if (response.data.success) {
        setSellers(response.data.data.items)
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

  const handleViewDetails = async (sellerId) => {
    try {
      setActionLoading(sellerId)
      const response = await adminService.getSellerById(sellerId)
      if (response.data.success) {
        setSelectedSeller(response.data.data)
        setShowDetails(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ NEW: Handle status update
  const handleUpdateStatus = (seller) => {
    setSelectedSeller(seller)
    setShowStatusModal(true)
  }

  const handleDelete = async (sellerId) => {
    if (!confirm("Are you sure you want to delete this seller? This cannot be undone.")) return

    try {
      setActionLoading(sellerId)
      const response = await adminService.deleteSeller(sellerId)
      if (response.data.success) {
        fetchSellers()
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
    setTimeout(fetchSellers, 0)
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Seller
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <SellerFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchSellers}
        onReset={() => {
          setFilters({ SearchTerm: "", City: "", IsActive: "", IsVerified: "", PageNumber: 1, PageSize: 10 })
          setTimeout(fetchSellers, 0)
        }}
      />

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Shop Name</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">City</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Sales</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No sellers found
                </td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller.sellerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {seller.shopLogo && (
                        <img
                          src={seller.shopLogo}
                          alt=""
                          className="object-cover w-10 h-10 mr-3 rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-900">{seller.shopName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{seller.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{seller.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          seller.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {seller.isVerified ? "✓ Verified" : "⚠ Unverified"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          seller.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {seller.isActive ? "● Active" : "○ Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    Rs. {seller.totalSales?.toLocaleString() || "0"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {seller.overallRating?.toFixed(1) || "N/A"} ({seller.totalReviews || 0})
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(seller.sellerId)}
                        disabled={actionLoading === seller.sellerId}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(seller)} // ✅ CHANGED
                        disabled={actionLoading === seller.sellerId}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                        title="Update Status"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(seller.sellerId)}
                        disabled={actionLoading === seller.sellerId}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Seller"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {sellers.length} of {pagination.totalCount} sellers
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

      {showDetails && <SellerDetails seller={selectedSeller} onClose={() => setShowDetails(false)} />}

      {/* ✅ NEW: Status Modal */}
      {showStatusModal && (
        <SellerStatusModal
          seller={selectedSeller}
          onClose={() => setShowStatusModal(false)}
          onSuccess={fetchSellers}
        />
      )}

      {showCreateForm && <CreateSellerForm onClose={() => setShowCreateForm(false)} onSuccess={fetchSellers} />}
    </div>
  )
}

export default SellersList