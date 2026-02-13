"use client"

import { useEffect, useState } from "react"
import { Search, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const StockHistory = ({ onSelectProduct }) => {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    searchTerm: "",
    adjustmentType: "",
    startDate: "",
    endDate: "",
    isAutomated: null,
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchHistory()
    fetchStats()
  }, [filters, pageNumber])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getStockHistory({
        SearchTerm: filters.searchTerm || undefined,
        AdjustmentType: filters.adjustmentType || undefined,
        StartDate: filters.startDate || undefined,
        EndDate: filters.endDate || undefined,
        IsAutomated: filters.isAutomated,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })
      setHistory(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 0)
    } catch (error) {
      console.error("Error fetching history:", error)
      alert(error.message || "Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await inventoryService.getStockHistoryStats({
        StartDate: filters.startDate || undefined,
        EndDate: filters.endDate || undefined,
      })
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getAdjustmentColor = (type) => {
    switch (type) {
      case "Restock":
        return "bg-green-100 text-green-700"
      case "Sale":
        return "bg-blue-100 text-blue-700"
      case "Return":
        return "bg-purple-100 text-purple-700"
      case "Damage":
        return "bg-red-100 text-red-700"
      case "Adjustment":
      case "ManualUpdate":
        return "bg-yellow-100 text-yellow-700"
      case "Transfer":
        return "bg-orange-100 text-orange-700"
      case "BulkUpdate":
        return "bg-indigo-100 text-indigo-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stock History</h2>
        <p className="text-gray-600">Complete record of all stock adjustments</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Adjustments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdjustments || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Added</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStockIncreased || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Removed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStockDecreased || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthAdjustments || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Type Breakdown */}
      {stats?.adjustmentsByType && stats.adjustmentsByType.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Adjustment Type Breakdown</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats.adjustmentsByType.map((typeData) => (
              <div key={typeData.adjustmentType} className="p-4 text-center rounded-lg bg-gray-50">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-2 ${getAdjustmentColor(typeData.adjustmentType)}`}
                >
                  {typeData.adjustmentType}
                </span>
                <p className="text-2xl font-bold text-gray-900">{typeData.count}</p>
                <p className="mt-1 text-xs text-gray-500">{typeData.totalQuantityChanged} units</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search product or manager..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.adjustmentType}
            onChange={(e) => setFilters({ ...filters, adjustmentType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Restock">Restock</option>
            <option value="Sale">Sale</option>
            <option value="Return">Return</option>
            <option value="Damage">Damage</option>
            <option value="ManualUpdate">Manual Update</option>
            <option value="BulkUpdate">Bulk Update</option>
            <option value="Transfer">Transfer</option>
          </select>
          <div className="relative">
            <Calendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.isAutomated === null ? "" : filters.isAutomated.toString()}
            onChange={(e) =>
              setFilters({ ...filters, isAutomated: e.target.value === "" ? null : e.target.value === "true" })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Adjustments</option>
            <option value="false">Manual Only</option>
            <option value="true">Automated Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : history.length > 0 ? (
        <>
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Change
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Stock After
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Adjusted By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.stockAdjustmentId} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(record.adjustmentDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onSelectProduct(record.productId)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {record.productName}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getAdjustmentColor(record.adjustmentType)}`}
                        >
                          {record.adjustmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${record.quantityChanged > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {record.quantityChanged > 0 ? "+" : ""}
                          {record.quantityChanged}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {record.newQuantity}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-sm text-gray-600 truncate">{record.reason || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {record.adjustedBy}
                        {record.isAutomated && (
                          <span className="px-2 py-1 ml-2 text-xs text-gray-600 bg-gray-100 rounded-full">Auto</span>
                        )}
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
          <p className="text-gray-600">No history records found</p>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default StockHistory