"use client"

import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"

const SellerFilters = ({ filters, setFilters, onApply, onReset }) => {
  const cityOptions = [
    { value: "", label: "All Cities" },
    { value: "Lahore", label: "Lahore" },
    { value: "Karachi", label: "Karachi" },
    { value: "Islamabad", label: "Islamabad" },
  ]

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ]

  const verifiedOptions = [
    { value: "", label: "All Verification" },
    { value: "true", label: "Verified" },
    { value: "false", label: "Unverified" },
  ]

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Search by shop name or email..."
          value={filters.SearchTerm || ""}
          onChange={(e) => setFilters({ ...filters, SearchTerm: e.target.value })}
        />

        <Select
          options={cityOptions}
          value={filters.City || ""}
          onChange={(e) => setFilters({ ...filters, City: e.target.value })}
        />

        <Select
          options={statusOptions}
          value={filters.IsActive || ""}
          onChange={(e) => setFilters({ ...filters, IsActive: e.target.value })}
        />

        <Select
          options={verifiedOptions}
          value={filters.IsVerified || ""}
          onChange={(e) => setFilters({ ...filters, IsVerified: e.target.value })}
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

export default SellerFilters
