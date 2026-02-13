"use client"

import { useEffect, useState } from "react"
import { Edit, Star } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import ProductFilters from "./ProductFilters"
import ProductStatusModal from "./ProductStatusModal"

const ProductsList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    SearchTerm: "",
    Category: "",
    MinPrice: "",
    MaxPrice: "",
    SellerId: "",
    InStock: "",
    IsActive: "",
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories()
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getProducts(cleanFilters)
      if (response.data.success) {
        setProducts(response.data.data.items)
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

  const handleUpdateStatus = (product) => {
    setSelectedProduct(product)
    setShowStatusModal(true)
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchProducts, 0)
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <Button onClick={fetchProducts}>Refresh</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onApply={fetchProducts}
        onReset={() => {
          setFilters({
            SearchTerm: "",
            Category: "",
            MinPrice: "",
            MaxPrice: "",
            SellerId: "",
            InStock: "",
            IsActive: "",
            PageNumber: 1,
            PageSize: 10,
          })
          setTimeout(fetchProducts, 0)
        }}
      />

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Seller</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.productImage && (
                        <img
                          src={product.productImage || "/placeholder.svg"}
                          alt=""
                          className="object-cover w-12 h-12 mr-3 rounded"
                        />
                      )}
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{product.productName}</p>
                        <p className="text-xs text-gray-500">ID: {product.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{product.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{product.sellerShopName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    Rs. {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm ${product.stockQuantity > 0 ? "text-green-600" : "text-red-600"} font-medium`}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{product.averageRating?.toFixed(1) || "0.0"}</span>
                      <span className="text-gray-400">({product.totalReviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleUpdateStatus(product)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                      Update
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
              Showing {products.length} of {pagination.totalCount} products
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

      {showStatusModal && (
        <ProductStatusModal
          product={selectedProduct}
          onClose={() => setShowStatusModal(false)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  )
}

export default ProductsList
