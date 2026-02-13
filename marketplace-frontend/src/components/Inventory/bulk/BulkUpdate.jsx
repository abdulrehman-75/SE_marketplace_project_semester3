"use client"

import { useState } from "react"
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const BulkUpdate = () => {
  const [updates, setUpdates] = useState([{ productId: "", quantity: "" }])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState(null)

  const addRow = () => {
    setUpdates([...updates, { productId: "", quantity: "" }])
  }

  const removeRow = (index) => {
    setUpdates(updates.filter((_, i) => i !== index))
  }

  const updateRow = (index, field, value) => {
    const newUpdates = [...updates]
    newUpdates[index][field] = value
    setUpdates(newUpdates)
  }

  const handleBulkUpdate = async () => {
    const validUpdates = updates.filter((u) => u.productId && u.quantity !== "")

    if (validUpdates.length === 0) {
      alert("Please fill in at least one complete row")
      return
    }

    // Validate quantities
    const invalidQuantities = validUpdates.filter(u => parseInt(u.quantity) < 0)
    if (invalidQuantities.length > 0) {
      alert("Stock quantities cannot be negative")
      return
    }

    if (!window.confirm(`Are you sure you want to update ${validUpdates.length} products?`)) {
      return
    }

    try {
      setProcessing(true)
      const response = await inventoryService.bulkUpdateStock({
        updates: validUpdates.map((u) => ({
          productId: parseInt(u.productId),
          quantity: parseInt(u.quantity),
        })),
      })
      
      // Handle response
      if (response.data) {
        const successCount = response.data.filter(r => r.productId).length
        setResults({
          totalAttempted: validUpdates.length,
          successCount: successCount,
          failureCount: validUpdates.length - successCount,
          results: response.data
        })
        alert(`Bulk update completed: ${successCount} succeeded`)
        
        // Clear successful updates
        if (successCount === validUpdates.length) {
          setUpdates([{ productId: "", quantity: "" }])
        }
      }
    } catch (error) {
      console.error("Error in bulk update:", error)
      alert(error.message || "Bulk update failed")
    } finally {
      setProcessing(false)
    }
  }

  const exportTemplate = () => {
    const csv = "ProductId,StockQuantity\n1,50\n2,100\n3,75"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-update-template.csv"
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Stock Update</h2>
        <p className="text-gray-600">Update multiple products at once</p>
      </div>

      {/* Info Banner */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-1 text-blue-600" size={20} />
          <div>
            <p className="font-medium text-blue-900">Bulk Update Instructions</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Enter Product ID and new stock quantity for each product</li>
              <li>• Stock quantity must be 0 or greater</li>
              <li>• All fields are required for each row</li>
              <li>• You can download a CSV template for reference</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={exportTemplate}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download size={18} />
          Download Template
        </button>
        <button
          onClick={() => {
            alert("CSV import feature coming soon!")
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Upload size={18} />
          Import CSV
        </button>
      </div>

      {/* Bulk Update Form */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Product ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  New Stock Quantity
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {updates.map((update, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      placeholder="Enter Product ID"
                      value={update.productId}
                      onChange={(e) => updateRow(index, "productId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      placeholder="Enter new quantity"
                      value={update.quantity}
                      onChange={(e) => updateRow(index, "quantity", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={updates.length === 1}
                    >
                      <XCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Row & Submit */}
      <div className="flex gap-4">
        <button onClick={addRow} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          + Add Row
        </button>
        <button
          onClick={handleBulkUpdate}
          disabled={processing}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Submit Bulk Update"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 text-center rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Total Attempted</p>
              <p className="text-2xl font-bold text-gray-900">{results.totalAttempted}</p>
            </div>
            <div className="p-4 text-center rounded-lg bg-green-50">
              <p className="text-sm text-green-600">Succeeded</p>
              <p className="text-2xl font-bold text-green-700">{results.successCount}</p>
            </div>
            <div className="p-4 text-center rounded-lg bg-red-50">
              <p className="text-sm text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-700">{results.failureCount}</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-2">
            <h4 className="mb-2 font-semibold text-gray-900">Detailed Results:</h4>
            {results.results?.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.productId ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.productId ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {result.productName || `Product ID: ${updates[index]?.productId}`}
                    </p>
                    {result.productId && (
                      <p className="text-sm text-gray-600">
                        Stock updated from {result.oldStockQuantity} to {result.newStockQuantity}
                      </p>
                    )}
                  </div>
                </div>
                {result.productId && (
                  <span className="text-sm font-semibold text-gray-900">
                    New Stock: {result.newStockQuantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkUpdate