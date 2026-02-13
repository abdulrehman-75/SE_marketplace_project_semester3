"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import StaffList from "./StaffList"

const StaffManagement = ({ staffType }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [staff, setStaff] = useState([])
  const [actionLoading, setActionLoading] = useState(null)

  const staffTypeMap = {
    "staff-delivery": { key: "delivery", title: "Delivery Staff", service: "getDeliveryStaff" },
    "staff-support": { key: "support", title: "Support Staff", service: "getSupportStaff" },
    "staff-inventory": { key: "inventory", title: "Inventory Managers", service: "getInventoryManagers" },
  }

  const config = staffTypeMap[staffType]

  useEffect(() => {
    if (config) {
      fetchStaff()
    }
  }, [staffType])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService[config.service]()
      if (response.data.success) {
        setStaff(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (member) => {
    const newStatus = !member.isActive
    if (!confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this staff member?`)) return

    try {
      setActionLoading(member.staffId)
      const response = await adminService.updateStaffStatus(config.key, member.staffId, newStatus)
      if (response.data.success) {
        fetchStaff()
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (!config) {
    return <div className="text-red-600">Invalid staff type</div>
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
        <div className="flex gap-2">
          <Button onClick={fetchStaff}>Refresh</Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add {config.title}
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <StaffList staff={staff} loading={loading} onUpdateStatus={handleUpdateStatus} />

      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Staff members cannot be edited after creation. You can only activate or deactivate
          their accounts.
        </p>
      </div>
    </div>
  )
}

export default StaffManagement
