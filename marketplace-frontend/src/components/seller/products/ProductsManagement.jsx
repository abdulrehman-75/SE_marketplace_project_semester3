// components/seller/products/ProductsManagement.jsx
"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Trash2, AlertCircle, Eye, Loader2 } from "lucide-react"
import sellerService from "../../../services/sellerService"

const ProductsManagement = ({ onSelectProduct, onCreateProduct }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter, sortBy, pageNumber])

  const fetchCategories = async () => {
    try {
      const response = await sellerService.getCategories()
      console.log("Categories API Response:", response)
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setCategories(response.data)
        } else if (response.data.items && Array.isArray(response.data.items)) {
          setCategories(response.data.items)
        } else {
          setCategories([])
        }
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await sellerService.getProducts({
        SearchTerm: searchTerm || undefined,
        CategoryId: categoryFilter || undefined,
        SortBy: sortBy,
        PageNumber: pageNumber,
        PageSize: pageSize,
      })

      console.log("Products API Response:", response)

      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        setProducts(Array.isArray(apiData.items) ? apiData.items : [])
        setTotalPages(apiData.totalPages || 0)
      } else if (response.data?.items) {
        setProducts(Array.isArray(response.data.items) ? response.data.items : [])
        setTotalPages(response.data.totalPages || 0)
      } else if (Array.isArray(response.data)) {
        setProducts(response.data)
        setTotalPages(1)
      } else {
        setProducts([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error.message || "Failed to load products")
      setProducts([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      await sellerService.deleteProduct(productId)
      alert("Product deleted successfully")
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert(error.message || "Failed to delete product")
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "red" }
    if (stock < 10) return { label: "Low Stock", color: "yellow" }
    return { label: "In Stock", color: "green" }
  }

  const getImageSrc = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
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
      <div className="p-4 text-center bg-white border border-red-200 rounded-lg sm:p-6">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">Error Loading Products</p>
        <p className="mb-4 text-sm text-gray-600 sm:text-base">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg sm:px-6 sm:text-base hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Products</h2>
          <p className="text-sm text-gray-600 sm:text-base">Manage your product catalog</p>
        </div>
        <button
          onClick={onCreateProduct}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="sales">Sort by Sales</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock || 0)
              return (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageSrc(product.imageUrl)}
                      alt={product.name}
                      className="object-cover w-full h-48 bg-gray-100"
                      loading="lazy"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                        stockStatus.color === "red"
                          ? "bg-red-100 text-red-700"
                          : stockStatus.color === "yellow"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-base font-semibold text-gray-900 truncate sm:text-lg">{product.name}</h3>
                    <p className="mt-1 text-xs text-gray-500 truncate sm:text-sm">{product.categoryName || "Uncategorized"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-gray-900 sm:text-xl">
                        ${product.price ? product.price.toFixed(2) : "0.00"}
                      </span>
                      <span className="text-xs text-gray-600 sm:text-sm">Stock: {product.stock || 0}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => onSelectProduct(product.id)}
                        className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-2 text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg sm:w-auto hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 sm:px-4 sm:py-2">
                Page {pageNumber} of {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg sm:w-auto hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-lg">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">No products found</p>
          <p className="mb-4 text-sm text-gray-600 sm:text-base">
            {searchTerm || categoryFilter ? "Try adjusting your filters" : "Start building your catalog"}
          </p>
          <button
            onClick={onCreateProduct}
            className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg sm:px-6 sm:text-base hover:bg-blue-700"
          >
            Create Your First Product
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductsManagement