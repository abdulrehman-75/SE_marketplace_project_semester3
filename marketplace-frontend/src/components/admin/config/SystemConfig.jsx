"use client"

import { useEffect, useState } from "react"
import { Edit, Save, X } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"

const SystemConfig = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [configs, setConfigs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getSystemConfig()
      if (response.data.success) {
        setConfigs(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config) => {
    setEditingId(config.configId)
    setEditValue(config.configValue)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleSave = async (configId) => {
    try {
      setSaving(true)
      setError(null)
      const response = await adminService.updateSystemConfig({
        configId,
        configValue: editValue,
      })
      if (response.data.success) {
        fetchConfigs()
        setEditingId(null)
        setEditValue("")
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>

      {error && <ErrorMessage message={error} />}

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Setting</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.configId} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{config.configKey}</td>
                <td className="px-6 py-4">
                  {editingId === config.configId ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{config.configValue}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{config.description}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>
                    <p>{new Date(config.lastUpdated).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">by {config.updatedBy}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {editingId === config.configId ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(config.configId)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button onClick={handleCancel} disabled={saving} className="text-red-600 hover:text-red-800">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(config)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Changing these settings may affect the entire platform. Please be careful when
          updating configuration values.
        </p>
      </div>
    </div>
  )
}

export default SystemConfig
