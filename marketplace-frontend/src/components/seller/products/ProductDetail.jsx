"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Edit2, Trash2, Upload, X, AlertCircle, Loader2 } from "lucide-react"
import sellerService from "../../../services/sellerService"

const ProductDetail = ({ productId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [stockUpdate, setStockUpdate] = useState({ quantity: "", reason: "" })

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchCategories()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getProductById(productId)
      setProduct(response.data)
      setFormData({
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
        categoryId: response.data.categoryId,
        isActive: response.data.isActive,
      })
    } catch (error) {
      console.error("Error fetching product:", error)
      alert(error.message || "Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await sellerService.getCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await sellerService.updateProduct(productId, formData)
      alert("Product updated successfully")
      setEditing(false)
      fetchProduct()
    } catch (error) {
      console.error("Error updating product:", error)
      alert(error.message || "Failed to update product")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      await sellerService.deleteProduct(productId)
      alert("Product deleted successfully")
      onBack()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert(error.message || "Failed to delete product")
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) return

    try {
      await sellerService.uploadProductImage(productId, imageFile)
      alert("Image uploaded successfully")
      setImageFile(null)
      fetchProduct()
    } catch (error) {
      console.error("Error uploading image:", error)
      alert(error.message || "Failed to upload image")
    }
  }

  const handleImageDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the product image?")) {
      return
    }

    try {
      await sellerService.deleteProductImage(productId)
      alert("Image deleted successfully")
      fetchProduct()
    } catch (error) {
      console.error("Error deleting image:", error)
      alert(error.message || "Failed to delete image")
    }
  }

  const handleStockUpdate = async (e) => {
    e.preventDefault()
    try {
      await sellerService.updateStock(productId, {
        quantity: Number.parseInt(stockUpdate.quantity),
        reason: stockUpdate.reason,
      })
      alert("Stock updated successfully")
      setStockUpdate({ quantity: "", reason: "" })
      fetchProduct()
    } catch (error) {
      console.error("Error updating stock:", error)
      alert(error.message || "Failed to update stock")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Product not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "red" }
    if (stock < 10) return { label: "Low Stock", color: "yellow" }
    return { label: "In Stock", color: "green" }
  }

  const stockStatus = getStockStatus(product.stock)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onBack} className="flex items-center self-start gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">Back to Products</span>
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg sm:px-4 hover:bg-blue-700"
          >
            <Edit2 size={18} />
            {editing ? "Cancel Edit" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg sm:px-4 hover:bg-red-700"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Product Image & Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Image Card */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Product Image</h3>
            <img
              src={product.imageUrl || "/placeholder.svg?height=400&width=400&query=product"}
              alt={product.name}
              className="object-cover w-full h-48 mb-4 rounded-lg sm:h-64"
            />
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleImageUpload}
                  disabled={!imageFile}
                  className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg sm:px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={18} />
                  Upload Image
                </button>
                {product.imageUrl && (
                  <button
                    onClick={handleImageDelete}
                    className="px-3 py-2 text-red-600 rounded-lg sm:px-4 bg-red-50 hover:bg-red-100"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Stock Management</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 sm:text-base">Current Stock:</span>
              <span className="text-xl font-bold text-gray-900 sm:text-2xl">{product.stock}</span>
            </div>
            <span
              className={`inline-block px-3 py-1 text-xs sm:text-sm font-medium rounded-full mb-4 ${
                stockStatus.color === "red"
                  ? "bg-red-100 text-red-700"
                  : stockStatus.color === "yellow"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {stockStatus.label}
            </span>
            <form onSubmit={handleStockUpdate} className="space-y-3">
              <input
                type="number"
                placeholder="Quantity to add/remove"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Reason for stock update"
                value={stockUpdate.reason}
                onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit" className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded-lg sm:text-base hover:bg-green-700">
                Update Stock
              </button>
            </form>
          </div>
        </div>

        {/* Product Details Form */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Product Details</h3>
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <button type="submit" className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg sm:text-base hover:bg-blue-700">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Product Name</label>
                <p className="text-sm font-medium text-gray-900 break-words sm:text-base">{product.name}</p>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Description</label>
                <p className="text-sm text-gray-900 break-words sm:text-base">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Price</label>
                  <p className="text-lg font-bold text-gray-900 sm:text-xl">${product.price}</p>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Category</label>
                  <p className="text-sm text-gray-900 break-words sm:text-base">{product.categoryName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Total Sales</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{product.totalSales || 0}</p>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Average Rating</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{(product.averageRating || 0).toFixed(1)} ⭐</p>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 sm:text-sm">Status</label>
                <span
                  className={`inline-block px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                    product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail