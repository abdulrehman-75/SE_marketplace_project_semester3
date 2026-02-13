"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import Input from "../../common/Input"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const categorySchema = z.object({
  categoryName: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  isActive: z.boolean(),
})

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditMode = !!category

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          categoryName: category.categoryName,
          description: category.description || "",
          isActive: category.isActive,
        }
      : {
          categoryName: "",
          description: "",
          isActive: true,
        },
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (isEditMode) {
        response = await adminService.updateCategory({
          categoryId: category.categoryId,
          ...data,
        })
      } else {
        response = await adminService.createCategory(data)
      }

      if (response.data.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isEditMode ? "Edit Category" : "Create New Category"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 sm:p-6">
          {error && <ErrorMessage message={error} />}

          <div>
            <Input 
              label="Category Name *" 
              {...register("categoryName")} 
              error={errors.categoryName?.message}
              placeholder="e.g., Electronics, Fashion, Books"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe this category (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input 
              type="checkbox" 
              id="isActive" 
              {...register("isActive")} 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (Category will be visible to customers)
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                  Saving...
                </span>
              ) : (
                isEditMode ? "Update Category" : "Create Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryForm