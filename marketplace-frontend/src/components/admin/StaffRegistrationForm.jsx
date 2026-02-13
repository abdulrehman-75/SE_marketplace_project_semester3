"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import Input from "../common/Input"
import PasswordInput from "../common/PasswordInput"
import Select from "../common/Select"
import Button from "../common/Button"
import ErrorMessage from "../common/ErrorMessage"
import { 
  PHONE_PREFIXES, 
  VEHICLE_TYPES, 
  WAREHOUSE_LOCATIONS, 
  SUPPORT_SPECIALIZATIONS, 
  DEPARTMENTS,
  DELIVERY_AREAS 
} from "../../utils/constants"

const StaffRegistrationForm = ({ staffType, schema, onSubmit, isLoading }) => {
  const [phonePrefix, setPhonePrefix] = useState("+92")
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      employeeCode: "",
      department: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
      licenseNumber: "",
      assignedArea: "",
      specialization: "",
      assignedWarehouse: "",
    }
  })

  const [serverError, setServerError] = useState("")

  const handleFormSubmit = async (data) => {
    console.log("📝 Form data being submitted:", data)
    setServerError("")
    
    // Combine phone prefix with phone number
    const phoneWithPrefix = data.phone ? `${phonePrefix}${data.phone}` : ""
    const submissionData = { ...data, phone: phoneWithPrefix }
    
    try {
      await onSubmit(submissionData)
      reset()
      setPhonePrefix("+92") // Reset phone prefix
      setServerError("")
    } catch (error) {
      console.error("❌ Form submission error:", error)
      const errorMsg = error.response?.data?.message || error.message || "Registration failed. Please try again."
      setServerError(errorMsg)
    }
  }

  const renderStaffSpecificFields = () => {
    switch (staffType) {
      case "delivery":
        return (
          <>
            <Select
              label="Vehicle Type (Optional)"
              {...register("vehicleType")}
              error={errors.vehicleType?.message}
              disabled={isLoading}
              options={[
                { value: "", label: "Select Vehicle Type" },
                ...VEHICLE_TYPES
              ]}
            />
            
            <Input
              label="Vehicle Number (Optional)"
              type="text"
              placeholder="e.g., ABC-123"
              {...register("vehicleNumber")}
              error={errors.vehicleNumber?.message}
              disabled={isLoading}
            />
            
            <Input
              label="License Number (Optional)"
              type="text"
              placeholder="Enter license number"
              {...register("licenseNumber")}
              error={errors.licenseNumber?.message}
              disabled={isLoading}
            />
            
            <Select
              label="Assigned Area (Optional)"
              {...register("assignedArea")}
              error={errors.assignedArea?.message}
              disabled={isLoading}
              options={[
                { value: "", label: "Select Delivery Area" },
                ...DELIVERY_AREAS
              ]}
            />
          </>
        )
        
      case "inventory":
        return (
          <>
            <Select
              label="Assigned Warehouse (Optional)"
              {...register("assignedWarehouse")}
              error={errors.assignedWarehouse?.message}
              disabled={isLoading}
              options={[
                { value: "", label: "Select Warehouse" },
                ...WAREHOUSE_LOCATIONS
              ]}
            />
          </>
        )
        
      case "support":
        return (
          <>
            <Select
              label="Specialization (Optional)"
              {...register("specialization")}
              error={errors.specialization?.message}
              disabled={isLoading}
              options={[
                { value: "", label: "Select Specialization" },
                ...SUPPORT_SPECIALIZATIONS
              ]}
            />
          </>
        )
        
      case "admin":
        return null
        
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && <ErrorMessage message={serverError} className="mb-4" />}

      {/* Common Fields for All Staff */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Enter full name"
        {...register("fullName")}
        error={errors.fullName?.message}
        disabled={isLoading}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter email address"
        {...register("email")}
        error={errors.email?.message}
        disabled={isLoading}
      />

      {/* Phone Number with Prefix */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Phone Number (Optional)
        </label>
        <div className="flex gap-2">
          <select
            value={phonePrefix}
            onChange={(e) => setPhonePrefix(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {PHONE_PREFIXES.map((prefix) => (
              <option key={prefix.value} value={prefix.value}>
                {prefix.value}
              </option>
            ))}
          </select>
          
          <Input
            type="tel"
            placeholder="3001234567"
            {...register("phone")}
            error={errors.phone?.message}
            disabled={isLoading}
            className="flex-1"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <Input
        label="Employee Code (Optional)"
        type="text"
        placeholder="e.g., EMP001"
        {...register("employeeCode")}
        error={errors.employeeCode?.message}
        disabled={isLoading}
      />

      <Select
        label="Department (Optional)"
        {...register("department")}
        error={errors.department?.message}
        disabled={isLoading}
        options={[
          { value: "", label: "Select Department" },
          ...DEPARTMENTS
        ]}
      />

      {/* Staff-specific fields */}
      {renderStaffSpecificFields()}

      {/* Password Fields */}
      <PasswordInput
        label="Password"
        placeholder="Min 6 chars, 1 lowercase, 1 digit"
        {...register("password")}
        error={errors.password?.message}
        disabled={isLoading}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
        Register Staff Member
      </Button>
    </form>
  )
}

export default StaffRegistrationForm