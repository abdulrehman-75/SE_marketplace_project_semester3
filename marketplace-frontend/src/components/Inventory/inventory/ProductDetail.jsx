"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Save, Phone, Mail, Package, TrendingUp } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const ProductDetail = ({ productId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [stockUpdate, setStockUpdate] = useState({
    quantity: "",
    notes: "",
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchHistory()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getProductById(productId)
      console.log("Product response:", response) // Debug log
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
      alert(error.message || "Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await inventoryService.getProductHistory(productId, {
        PageNumber: 1,
        PageSize: 10,
      })
      console.log("History response:", response) // Debug log
      // Handle both possible response structures
      const historyData = response.data?.adjustmentHistory || response.data?.items || []
      setHistory(historyData)
    } catch (error) {
      console.error("Error fetching history:", error)
    }
  }

  const handleStockUpdate = async (e) => {
    e.preventDefault()
    try {
      await inventoryService.updateStock(productId, {
        quantity: parseInt(stockUpdate.quantity),
        notes: stockUpdate.notes,
      })
      alert("Stock updated successfully")
      setStockUpdate({ quantity: "", notes: "" })
      fetchProduct()
      fetchHistory()
    } catch (error) {
      console.error("Error updating stock:", error)
      alert(error.message || "Failed to update stock")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Product not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  const getStockStatus = () => {
    if (product.stockQuantity === 0) return { label: "Out of Stock", color: "red" }
    if (product.stockQuantity < product.lowStockThreshold * 0.5) return { label: "Critical", color: "red" }
    if (product.stockQuantity < product.lowStockThreshold) return { label: "Low Stock", color: "yellow" }
    return { label: "In Stock", color: "green" }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Product Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Info Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex gap-6">
              <img
                src={product.productImage || "/api/placeholder/200/200"}
                alt={product.productName}
                className="object-cover w-48 h-48 rounded-lg"
                onError={(e) => {
                  e.target.src = "/api/placeholder/200/200"
                }}
              />
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">{product.productName}</h2>
                <p className="mb-4 text-gray-600">{product.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">{product.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-xl font-semibold text-gray-900">${product.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-xl font-semibold text-gray-900">{product.stockQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Low Stock Threshold</p>
                    <p className="font-semibold text-gray-900">{product.lowStockThreshold}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${
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
              </div>
            </div>
          </div>

          {/* Seller Contact */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Seller Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Seller Name</p>
                  <p className="font-medium text-gray-900">{product.sellerShopName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${product.sellerEmail}`} className="font-medium text-blue-600 hover:underline">
                    {product.sellerEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a href={`tel:${product.sellerContactPhone}`} className="font-medium text-blue-600 hover:underline">
                    {product.sellerContactPhone || "Not provided"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Statistics */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
              <TrendingUp size={20} />
              Sales Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{product.totalSales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(product.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{product.isActive ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* Stock History */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Stock History</h3>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((record) => (
                  <div key={record.stockAdjustmentId} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.adjustmentType === "Restock"
                              ? "bg-green-100 text-green-700"
                              : record.adjustmentType === "Sale"
                                ? "bg-blue-100 text-blue-700"
                                : record.adjustmentType === "Return"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.adjustmentType}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {record.quantityChanged > 0 ? "+" : ""}
                          {record.quantityChanged}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{record.reason}</p>
                      {record.notes && <p className="mt-1 text-xs text-gray-500">Note: {record.notes}</p>}
                      <p className="mt-1 text-xs text-gray-400">
                        By {record.adjustedBy} • {new Date(record.adjustmentDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Stock After</p>
                      <p className="text-lg font-bold text-gray-900">{record.newQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">No history available</p>
            )}
          </div>
        </div>

        {/* Stock Update Form */}
        <div className="lg:col-span-1">
          <div className="sticky p-6 bg-white border border-gray-200 rounded-lg shadow-sm top-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Stock</h3>
            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">New Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="Enter new stock quantity"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">Current stock: {product.stockQuantity}</p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  placeholder="Reason for stock update..."
                  value={stockUpdate.notes}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                Update Stock
              </button>
            </form>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="mb-2 text-sm text-gray-600">Preview After Update:</p>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{product.stockQuantity}</p>
                {stockUpdate.quantity && (
                  <>
                    <p className="mt-2 text-sm text-gray-600">New Stock</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseInt(stockUpdate.quantity)}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">Change</p>
                    <p className={`text-lg font-bold ${parseInt(stockUpdate.quantity) - product.stockQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseInt(stockUpdate.quantity) - product.stockQuantity >= 0 ? '+' : ''}
                      {parseInt(stockUpdate.quantity) - product.stockQuantity}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail