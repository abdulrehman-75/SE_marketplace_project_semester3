"use client"

import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"

const PaymentFilters = ({ filters, setFilters, onApply, onReset }) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "VerificationPeriod", label: "Verification Period" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Released", label: "Released" },
    { value: "Frozen", label: "Frozen" },
    { value: "Disputed", label: "Disputed" },
  ]

  const booleanOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters.Status || ""}
          onChange={(e) => setFilters({ ...filters, Status: e.target.value })}
        />

        <Input
          label="Seller ID"
          type="number"
          placeholder="Enter seller ID..."
          value={filters.SellerId || ""}
          onChange={(e) => setFilters({ ...filters, SellerId: e.target.value })}
        />

        <Select
          label="Disputed"
          options={booleanOptions}
          value={filters.IsDisputed || ""}
          onChange={(e) => setFilters({ ...filters, IsDisputed: e.target.value })}
        />

        <Select
          label="Expired"
          options={booleanOptions}
          value={filters.IsExpired || ""}
          onChange={(e) => setFilters({ ...filters, IsExpired: e.target.value })}
        />

        <Input
          label="From Date"
          type="date"
          value={filters.FromDate || ""}
          onChange={(e) => setFilters({ ...filters, FromDate: e.target.value })}
        />

        <Input
          label="To Date"
          type="date"
          value={filters.ToDate || ""}
          onChange={(e) => setFilters({ ...filters, ToDate: e.target.value })}
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

export default PaymentFilters
