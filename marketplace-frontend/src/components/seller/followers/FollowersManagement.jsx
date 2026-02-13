"use client"

import { useEffect, useState } from "react"
import { Search, Users, ShoppingBag, DollarSign } from "lucide-react"
import sellerService from "../../../services/sellerService"

const FollowersManagement = () => {
  const [loading, setLoading] = useState(true)
  const [followers, setFollowers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchFollowers()
  }, [searchTerm, pageNumber])

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getFollowers({
        SearchTerm: searchTerm || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })
      setFollowers(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 0)
    } catch (error) {
      console.error("[v0] Error fetching followers:", error)
      alert(error.message || "Failed to load followers")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Followers</h2>
        <p className="text-gray-600">Customers following your shop</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">{followers.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBag className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {followers.reduce((sum, f) => sum + (f.totalOrders || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${followers.reduce((sum, f) => sum + (f.totalSpent || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
          <input
            type="text"
            placeholder="Search followers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Followers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : followers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {followers.map((follower) => (
              <div key={follower.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{follower.name}</h3>
                    <p className="text-sm text-gray-500">{follower.email}</p>
                  </div>
                </div>
                <div className="pt-4 space-y-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Orders:</span>
                    <span className="text-sm font-semibold text-gray-900">{follower.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(follower.totalSpent || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Following Since:</span>
                    <span className="text-sm text-gray-500">{new Date(follower.followedAt).toLocaleDateString()}</span>
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
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No followers yet</p>
          <p className="mt-2 text-sm text-gray-500">Start promoting your shop to gain followers!</p>
        </div>
      )}
    </div>
  )
}

export default FollowersManagement
