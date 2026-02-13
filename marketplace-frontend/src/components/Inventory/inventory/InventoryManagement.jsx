"use client"

import { useEffect, useState } from "react"
import { Search, Grid, List, AlertCircle } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const InventoryManagement = ({ onSelectProduct }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [viewMode, setViewMode] = useState("grid")
  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryId: "",
    sellerId: "",
    isLowStock: false,
    isOutOfStock: false,
    isActive: null,
    minPrice: "",
    maxPrice: "",
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters, pageNumber])

  const fetchCategories = async () => {
    try {
      const response = await inventoryService.getCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getProducts({
        SearchTerm: filters.searchTerm || undefined,
        CategoryId: filters.categoryId || undefined,
        SellerId: filters.sellerId || undefined,
        IsLowStock: filters.isLowStock || undefined,
        IsOutOfStock: filters.isOutOfStock || undefined,
        IsActive: filters.isActive,
        MinPrice: filters.minPrice || undefined,
        MaxPrice: filters.maxPrice || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })
      
      // Access items from response
      setProducts(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 0)
    } catch (error) {
      console.error("Error fetching products:", error)
      alert(error.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const getStockColor = (stock, threshold) => {
    if (stock === 0) return "text-red-600"
    if (stock < threshold * 0.5) return "text-red-600"
    if (stock < threshold) return "text-yellow-600"
    return "text-green-600"
  }

  const getStockBadge = (stock, threshold) => {
    if (stock === 0) return { label: "Out of Stock", color: "red" }
    if (stock < threshold * 0.5) return { label: "Critical", color: "red" }
    if (stock < threshold) return { label: "Low Stock", color: "yellow" }
    return { label: "In Stock", color: "green" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage and monitor all product inventory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option key="all-categories" value="">All Categories</option>
            {categories.map((cat) => (
              <option key={`category-${cat.categoryId}`} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <select
            value={filters.isActive === null ? "" : filters.isActive.toString()}
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value === "" ? null : e.target.value === "true" })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={filters.isLowStock}
              onChange={(e) => setFilters({ ...filters, isLowStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="lowStock" className="text-sm font-medium text-gray-700">
              Low Stock Only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="outOfStock"
              checked={filters.isOutOfStock}
              onChange={(e) => setFilters({ ...filters, isOutOfStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="outOfStock" className="text-sm font-medium text-gray-700">
              Out of Stock Only
            </label>
          </div>
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const stockBadge = getStockBadge(product.stockQuantity, product.lowStockThreshold)
                return (
                  <div
                    key={product.productId}
                    onClick={() => onSelectProduct(product.productId)}
                    className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={product.productImage || "/api/placeholder/200/200"}
                        alt={product.productName}
                        className="object-cover w-full h-48"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/200/200"
                        }}
                      />
                      <span
                        className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                          stockBadge.color === "red"
                            ? "bg-red-100 text-red-700"
                            : stockBadge.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {stockBadge.label}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.categoryName} • {product.sellerShopName}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        <span
                          className={`text-sm font-semibold ${getStockColor(product.stockQuantity, product.lowStockThreshold)}`}
                        >
                          Stock: {product.stockQuantity}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Threshold: {product.lowStockThreshold} | Sales: {product.totalSales || 0}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Stock
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
                    {products.map((product) => {
                      const stockBadge = getStockBadge(product.stockQuantity, product.lowStockThreshold)
                      return (
                        <tr key={product.productId} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.productImage || "/api/placeholder/40/40"}
                                alt={product.productName}
                                className="object-cover w-10 h-10 rounded"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/40/40"
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{product.productName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{product.categoryName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{product.sellerShopName}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            ${product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-semibold ${getStockColor(product.stockQuantity, product.lowStockThreshold)}`}
                            >
                              {product.stockQuantity} / {product.lowStockThreshold}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                stockBadge.color === "red"
                                  ? "bg-red-100 text-red-700"
                                  : stockBadge.color === "yellow"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {stockBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => onSelectProduct(product.productId)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
          <p className="text-gray-600">No products found</p>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement