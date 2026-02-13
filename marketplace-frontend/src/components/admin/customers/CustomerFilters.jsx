"use client"

import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"

const CustomerFilters = ({ filters, setFilters, onApply, onReset }) => {
  const cityOptions = [
    { value: "", label: "All Cities" },
    { value: "Lahore", label: "Lahore" },
    { value: "Karachi", label: "Karachi" },
    { value: "Islamabad", label: "Islamabad" },
  ]

  const activeOptions = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ]

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Search by name or email..."
          value={filters.SearchTerm || ""}
          onChange={(e) => setFilters({ ...filters, SearchTerm: e.target.value })}
        />

        <Select
          options={cityOptions}
          value={filters.City || ""}
          onChange={(e) => setFilters({ ...filters, City: e.target.value })}
        />

        <Select
          options={activeOptions}
          value={filters.IsActive || ""}
          onChange={(e) => setFilters({ ...filters, IsActive: e.target.value })}
        />

        <Input
          placeholder="Min Spent"
          type="number"
          value={filters.MinSpent || ""}
          onChange={(e) => setFilters({ ...filters, MinSpent: e.target.value })}
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

export default CustomerFilters
