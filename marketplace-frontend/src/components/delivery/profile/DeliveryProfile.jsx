// components/delivery/profile/DeliveryProfile.jsx
"use client"

import { useEffect, useState } from "react"
import { Edit2, Save, X, Truck, MapPin, Phone, Mail, Calendar, Award, Loader2 } from "lucide-react"
import deliveryStaffService from "../../../services/deliveryStaffService"

const DeliveryProfile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [availabilityToggling, setAvailabilityToggling] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await deliveryStaffService.getProfile()
      setProfile(response.data)
      setFormData({
        phone: response.data.phone || "",
        vehicleType: response.data.vehicleType || "",
        vehicleNumber: response.data.vehicleNumber || "",
        licenseNumber: response.data.licenseNumber || "",
        currentLocation: response.data.currentLocation || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      alert(error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await deliveryStaffService.updateProfile(formData)
      alert("Profile updated successfully")
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAvailability = async () => {
    try {
      setAvailabilityToggling(true)
      await deliveryStaffService.updateAvailability({
        isAvailable: !profile.isAvailable,
        currentLocation: profile.currentLocation
      })
      fetchProfile()
    } catch (error) {
      console.error("Error updating availability:", error)
      alert(error.message || "Failed to update availability")
    } finally {
      setAvailabilityToggling(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-600">Manage your delivery profile information</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {editing ? (
            <>
              <X size={18} />
              Cancel
            </>
          ) : (
            <>
              <Edit2 size={18} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stats Card */}
        <div className="space-y-6">
          {/* Availability Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Availability Status</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Currently Available</span>
              <button
                onClick={handleToggleAvailability}
                disabled={availabilityToggling || !profile.isActive}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.isAvailable ? "bg-green-500" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.isAvailable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {profile.isAvailable 
                ? "You are available for new deliveries" 
                : "You are not available for new deliveries"}
            </p>
            {!profile.isActive && (
              <p className="mt-2 text-sm text-red-600">
                Your account is inactive. Contact admin for assistance.
              </p>
            )}
          </div>

          {/* Statistics Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalDeliveries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful Deliveries</p>
                <p className="text-2xl font-bold text-green-600">{profile.successfulDeliveries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <div className="flex items-center gap-2">
                  <Award className="text-yellow-500 fill-yellow-500" size={20} />
                  <p className="text-2xl font-bold text-gray-900">{profile.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Profile Information</h3>
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Vehicle Type</label>
                  <input
                    type="text"
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Motorcycle, Van"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., ABC-1234"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Current Location</label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => handleInputChange("currentLocation", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Your current location or area"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900">{profile.fullName}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <p className="text-gray-900">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Assigned Area</label>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <p className="text-gray-900">{profile.assignedArea || "Not assigned"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Vehicle Information</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Vehicle Type</label>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-400" />
                      <p className="text-gray-900">{profile.vehicleType || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Vehicle Number</label>
                    <p className="text-gray-900">{profile.vehicleNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">License Number</label>
                    <p className="text-gray-900">{profile.licenseNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-400" />
                  <label className="text-sm font-medium text-gray-600">Current Location</label>
                </div>
                <p className="text-gray-900">{profile.currentLocation || "Not provided"}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Member since: {new Date(profile.dateJoined).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryProfile