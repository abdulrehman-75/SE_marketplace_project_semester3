"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const sellerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/\d/, "Must contain digit"),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  contactPhone: z.string().min(10, "Phone number is required"),
  contactEmail: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  isVerified: z.boolean(),
})

const CreateSellerForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      isVerified: false,
    },
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.createSeller(data)
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

  const cityOptions = [
    { value: "", label: "Select City" },
    { value: "Lahore", label: "Lahore" },
    { value: "Karachi", label: "Karachi" },
    { value: "Islamabad", label: "Islamabad" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Seller</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />

            <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />

            <Input label="Shop Name" {...register("shopName")} error={errors.shopName?.message} />

            <Input label="Contact Phone" {...register("contactPhone")} error={errors.contactPhone?.message} />

            <Input
              label="Contact Email"
              type="email"
              {...register("contactEmail")}
              error={errors.contactEmail?.message}
            />

            <Select label="City" options={cityOptions} {...register("city")} error={errors.city?.message} />

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isVerified" {...register("isVerified")} className="w-4 h-4" />
              <label htmlFor="isVerified" className="text-sm text-gray-700">
                Mark as verified
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Seller"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSellerForm
