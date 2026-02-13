"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Edit2, Package, Heart, DollarSign } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Input from "../../common/Input"
import Select from "../../common/Select"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import {CITIES} from "../../../utils/constants"

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^\+92\d{10}$/, "Phone must be in format +92XXXXXXXXXX"),
  shippingAddress: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  country: z.string().min(1, "Country is required"),
})

export default function Profile({ onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await customerService.getProfile()
      setProfile(response.data)

      setValue("fullName", response.data.fullName)
      setValue("phone", response.data.phone)
      setValue("shippingAddress", response.data.shippingAddress)
      setValue("city", response.data.city)
      setValue("postalCode", response.data.postalCode)
      setValue("country", response.data.country)
    } catch (error) {
      console.error("Error fetching profile:", error)
      alert("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      await customerService.updateProfile(data)
      alert("Profile updated successfully!")
      setEditing(false)
      fetchProfile()
    } catch (error) {
      alert(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    reset()
    setEditing(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader /></div>
  if (!profile) return <div className="text-center text-gray-600">Failed to load profile</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit2 size={18} className="mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-3 p-6 bg-white rounded-lg shadow">
          <div className="p-3 bg-blue-100 rounded-lg"><Package size={24} className="text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile.totalOrders}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-6 bg-white rounded-lg shadow">
          <div className="p-3 bg-green-100 rounded-lg"><DollarSign size={24} className="text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Rs. {profile.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-6 bg-white rounded-lg shadow">
          <div className="p-3 bg-purple-100 rounded-lg"><Heart size={24} className="text-purple-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile.followedSellersCount}</p>
            <p className="text-sm text-gray-600">Followed Sellers</p>
          </div>
        </div>
      </div>

      {/* Profile Form / Info */}
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-2 mb-6"><User size={24} className="text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Edit Profile</h2></div>

          <div className="space-y-4">
            <Input label="Full Name" {...register("fullName")} />
            {errors.fullName && <ErrorMessage message={errors.fullName.message} />}
            <label className="block text-sm text-gray-700">Email (Cannot be changed)</label>
            <input type="email" value={profile.email} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed" />
            <Input label="Phone Number" {...register("phone")} placeholder="+923001234567" />
            {errors.phone && <ErrorMessage message={errors.phone.message} />}
            <Input label="Shipping Address" {...register("shippingAddress")} placeholder="House #, Street, Area" />
            {errors.shippingAddress && <ErrorMessage message={errors.shippingAddress.message} />}
            <div className="grid grid-cols-2 gap-4">
              <Select label="City" {...register("city")}>
                <option value="">Select City</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </Select>
              {errors.city && <ErrorMessage message={errors.city.message} />}
              <Input label="Postal Code" {...register("postalCode")} placeholder="54000" maxLength={5} />
              {errors.postalCode && <ErrorMessage message={errors.postalCode.message} />}
            </div>
            <Input label="Country" {...register("country")} />
            {errors.country && <ErrorMessage message={errors.country.message} />}
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving} className="flex-1 bg-transparent">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? <Loader /> : "Save Changes"}</Button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-2 mb-6"><User size={24} className="text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Profile Information</h2></div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div><p className="text-sm text-gray-600">Full Name</p><p className="font-semibold text-gray-900">{profile.fullName}</p></div>
              <div><p className="text-sm text-gray-600">Email</p><p className="font-semibold text-gray-900">{profile.email}</p></div>
              <div><p className="text-sm text-gray-600">Phone</p><p className="font-semibold text-gray-900">{profile.phone}</p></div>
              <div><p className="text-sm text-gray-600">Country</p><p className="font-semibold text-gray-900">{profile.country}</p></div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="mb-1 text-sm text-gray-600">Shipping Address</p>
              <p className="font-semibold text-gray-900">{profile.shippingAddress}, {profile.city} - {profile.postalCode}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">{new Date(profile.dateRegistered).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
