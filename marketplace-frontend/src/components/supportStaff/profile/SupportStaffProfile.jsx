// components/supportStaff/profile/SupportStaffProfile.jsx
"use client"

import { useEffect, useState } from "react"
import { Edit2, X, Save, User, Mail, Phone, Briefcase, Calendar, Loader2, Award } from "lucide-react"
import supportStaffService from "../../../services/supportStaffService"

const SupportStaffProfile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await supportStaffService.getProfile()
      setProfile(response.data)
      setFormData({
        phone: response.data.phone || "",
        specialization: response.data.specialization || ""
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      alert(error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await supportStaffService.updateProfile(formData)
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
          <h2 className="text-2xl font-bold text-gray-900">Support Staff Profile</h2>
          <p className="text-gray-600">Manage your personal information</p>
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
        {/* Profile Card */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-24 h-24 mb-4 bg-blue-100 rounded-full">
              <User className="text-blue-600" size={48} />
            </div>
            <h3 className="mb-1 text-xl font-semibold text-gray-900">{profile.fullName}</h3>
            <p className="mb-3 text-sm text-gray-500">{profile.employeeCode}</p>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              profile.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}>
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="pt-6 mt-6 space-y-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Total Cases Handled</p>
              <p className="text-2xl font-bold text-gray-900">{profile.totalCasesHandled}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-orange-600">{profile.activeCases}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Personal Information</h3>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="E.g., Payment Disputes, Delivery Issues"
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
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-1 text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{profile.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="mt-1 text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-600">{profile.department || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="mt-1 text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Specialization</p>
                    <p className="text-sm text-gray-600">{profile.specialization || "General Support"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">{new Date(profile.dateJoined).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportStaffProfile