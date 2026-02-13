"use client"

import Select from "../../common/Select"
import Button from "../../common/Button"

const ComplaintFilters = ({ filters, setFilters, onApply, onReset }) => {
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "ProductQuality", label: "Product Quality" },
    { value: "PaymentDispute", label: "Payment Dispute" },
    { value: "DeliveryIssue", label: "Delivery Issue" },
    { value: "SellerIssue", label: "Seller Issue" },
    { value: "RefundRequest", label: "Refund Request" },
    { value: "Other", label: "Other" },
  ]

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Open", label: "Open" },
    { value: "InProgress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" },
    { value: "Escalated", label: "Escalated" },
  ]

  const priorityOptions = [
    { value: "", label: "All Priority" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ]

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          options={typeOptions}
          value={filters.ComplaintType || ""}
          onChange={(e) => setFilters({ ...filters, ComplaintType: e.target.value })}
        />

        <Select
          options={statusOptions}
          value={filters.Status || ""}
          onChange={(e) => setFilters({ ...filters, Status: e.target.value })}
        />

        <Select
          options={priorityOptions}
          value={filters.Priority || ""}
          onChange={(e) => setFilters({ ...filters, Priority: e.target.value })}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={onApply}>Apply Filters</Button>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}

export default ComplaintFilters
