"use client"

import { useState } from "react"
import { CheckCircle, XCircle, UserPlus } from "lucide-react"
import StaffRegistrationForm from "../StaffRegistrationForm"
import authService from "../../../services/authService"
import {
  registerDeliveryStaffSchema,
  registerInventoryManagerSchema,
  registerSupportStaffSchema,
  registerAdminSchema,
} from "../../../utils/validators"

const StaffRegistration = ({ onNavigate }) => {
  const [selectedStaffType, setSelectedStaffType] = useState("delivery")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const staffTypes = [
    {
      id: "delivery",
      label: "Delivery Staff",
      icon: "🚚",
      schema: registerDeliveryStaffSchema,
      service: authService.registerDeliveryStaff,
      description: "Responsible for order pickups and deliveries",
    },
    {
      id: "inventory",
      label: "Inventory Manager",
      icon: "📦",
      schema: registerInventoryManagerSchema,
      service: authService.registerInventoryManager,
      description: "Manage warehouse inventory and stock",
    },
    {
      id: "support",
      label: "Support Staff",
      icon: "💬",
      schema: registerSupportStaffSchema,
      service: authService.registerSupportStaff,
      description: "Handle customer complaints and support tickets",
    },
    {
      id: "admin",
      label: "Administrator",
      icon: "👤",
      schema: registerAdminSchema,
      service: authService.registerAdmin,
      description: "Full system access with administrative privileges",
    },
  ]

  const currentStaffType = staffTypes.find((type) => type.id === selectedStaffType)

  const handleStaffRegistration = async (data) => {
    console.log("👤 REGISTERING STAFF:", selectedStaffType, data)
    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await currentStaffType.service(data)
      console.log("✅ STAFF REGISTRATION RESPONSE:", response)

      setSuccessMessage(
        `${currentStaffType.label} "${data.fullName}" has been registered successfully! ` +
        `${data.employeeCode ? `Employee Code: ${data.employeeCode}` : ''}`
      )

      // Auto-hide success message after 7 seconds
      setTimeout(() => setSuccessMessage(""), 7000)
    } catch (error) {
      console.error("❌ STAFF REGISTRATION ERROR:", error)
      const errorMsg = error.response?.data?.message || error.message || "Registration failed"
      setErrorMessage(errorMsg)
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => setErrorMessage(""), 10000)

      // Re-throw to let form component handle it too
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (typeId) => {
    setSelectedStaffType(typeId)
    setSuccessMessage("")
    setErrorMessage("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register New Staff Member</h1>
        <p className="mt-1 text-gray-600">
          Create accounts for delivery staff, support staff, inventory managers, and administrators
        </p>
      </div>

      {/* Staff Type Selection */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          <UserPlus className="inline-block w-5 h-5 mr-2" />
          Select Staff Type
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {staffTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`p-4 rounded-lg text-left transition-all border-2 ${
                selectedStaffType === type.id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
              disabled={isLoading}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    selectedStaffType === type.id ? "text-blue-900" : "text-gray-900"
                  }`}>
                    {type.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-start p-4 border border-green-200 rounded-lg bg-green-50 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-green-900">Registration Successful!</p>
            <p className="mt-1 text-sm text-green-700">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="ml-3 text-green-600 hover:text-green-800"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start p-4 border border-red-200 rounded-lg bg-red-50 animate-fadeIn">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Registration Failed</p>
            <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="ml-3 text-red-600 hover:text-red-800"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Registration Form */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Register {currentStaffType.label}
        </h2>
        <div className="max-w-3xl">
          <StaffRegistrationForm
            key={selectedStaffType} // Force re-render when staff type changes
            staffType={selectedStaffType}
            schema={currentStaffType.schema}
            onSubmit={handleStaffRegistration}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Registration Guidelines */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">
            📋 Registration Guidelines
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• All email addresses must be unique across the system</li>
            <li>• Passwords must meet security requirements</li>
            <li>• Employee codes are optional but recommended</li>
            <li>• Staff members can be managed after creation</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <h3 className="mb-2 text-sm font-semibold text-green-900">
            ⚡ Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate("staff-delivery")}
              className="block w-full px-3 py-2 text-sm text-left text-green-800 transition-colors rounded hover:bg-green-100"
            >
              → View Delivery Staff
            </button>
            <button
              onClick={() => onNavigate("staff-support")}
              className="block w-full px-3 py-2 text-sm text-left text-green-800 transition-colors rounded hover:bg-green-100"
            >
              → View Support Staff
            </button>
            <button
              onClick={() => onNavigate("staff-inventory")}
              className="block w-full px-3 py-2 text-sm text-left text-green-800 transition-colors rounded hover:bg-green-100"
            >
              → View Inventory Managers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffRegistration