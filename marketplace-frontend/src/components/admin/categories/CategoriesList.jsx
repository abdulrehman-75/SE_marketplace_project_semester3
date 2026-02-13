"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import CategoryForm from "./CategoryForm"

const CategoriesList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getCategories()
      if (response.data.success) {
        setCategories(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setShowForm(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setShowForm(true)
  }

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category? This cannot be undone.")) return

    try {
      setActionLoading(categoryId)
      const response = await adminService.deleteCategory(categoryId)
      if (response.data.success) {
        fetchCategories()
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Categories Management</h1>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow col-span-full">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.categoryId}
              className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-lg"
            >
              {/* ✅ Icon Header Instead of Image */}
              <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-blue-500 to-blue-600">
                <Package className="w-16 h-16 text-white" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg line-clamp-2">
                    {category.categoryName}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                      category.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {category.description || "No description"}
                </p>

                <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Total Products</p>
                    <p className="text-lg font-semibold text-gray-900">{category.totalProducts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Products</p>
                    <p className="text-lg font-semibold text-gray-900">{category.activeProducts}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    disabled={actionLoading === category.categoryId}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-blue-600 transition-colors rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.categoryId)}
                    disabled={actionLoading === category.categoryId}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoryForm category={selectedCategory} onClose={() => setShowForm(false)} onSuccess={fetchCategories} />
      )}
    </div>
  )
}

export default CategoriesList