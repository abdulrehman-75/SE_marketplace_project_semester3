// components/seller/profile/ShopProfile.jsx
"use client"

import { useEffect, useState } from "react"
import { Edit2, Upload, X, Save, MapPin, Phone, Mail, Globe, Star, Loader2 } from "lucide-react"
import sellerService from "../../../services/sellerService"

const ShopProfile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    // Create preview URL for selected logo
    if (logoFile) {
      const objectUrl = URL.createObjectURL(logoFile)
      setLogoPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getProfile()
      setProfile(response.data)
      setFormData({
        shopName: response.data.shopName || "",
        description: response.data.description || "",
        address: response.data.address || "",
        city: response.data.city || "",
        state: response.data.state || "",
        zipCode: response.data.zipCode || "",
        country: response.data.country || "",
        phoneNumber: response.data.phoneNumber || "",
        email: response.data.email || "",
        website: response.data.website || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      alert(error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    try {
      setUploadingLogo(true)
      await sellerService.uploadShopLogo(logoFile)
      alert("Logo uploaded successfully")
      setLogoFile(null)
      setLogoPreview(null)
      fetchProfile()
    } catch (error) {
      console.error("Error uploading logo:", error)
      alert(error.message || "Failed to upload logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your shop logo?")) {
      return
    }

    try {
      await sellerService.deleteShopLogo()
      alert("Logo deleted successfully")
      fetchProfile()
    } catch (error) {
      console.error("Error deleting logo:", error)
      alert(error.message || "Failed to delete logo")
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await sellerService.updateProfile(formData)
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
          <h2 className="text-2xl font-bold text-gray-900">Shop Profile</h2>
          <p className="text-gray-600">Manage your shop information and settings</p>
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
        {/* Logo & Stats */}
        <div className="space-y-6">
          {/* Logo Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Shop Logo</h3>
            <div className="flex flex-col items-center">
              <img
                src={logoPreview || profile.logoUrl || "/api/placeholder/150/150"}
                alt="Shop Logo"
                className="object-cover w-32 h-32 mb-4 border-2 border-gray-200 rounded-lg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full mb-3 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex w-full gap-2">
                <button
                  onClick={handleLogoUpload}
                  disabled={!logoFile || uploadingLogo}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  {uploadingLogo ? "Uploading..." : "Upload"}
                </button>
                {profile.logoUrl && (
                  <button
                    onClick={handleLogoDelete}
                    className="px-4 py-2 text-red-600 rounded-lg bg-red-50 hover:bg-red-100"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Shop Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalProducts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalSales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(profile.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <p className="text-2xl font-bold text-gray-900">{(profile.averageRating || 0).toFixed(1)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalFollowers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Shop Information</h3>
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Shop Name *</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => handleInputChange("shopName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tell customers about your shop..."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://example.com"
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
              <div>
                <h4 className="mb-2 text-xl font-bold text-gray-900">{profile.shopName}</h4>
                <p className="text-gray-600">{profile.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6 border-t md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">
                        {profile.address || "Not provided"}
                        {profile.city && <><br />{profile.city}, {profile.state} {profile.zipCode}</>}
                        {profile.country && <><br />{profile.country}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{profile.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="mt-1 text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Website</p>
                      <p className="text-sm text-gray-600">
                        {profile.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-500">
                  Member since: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopProfile