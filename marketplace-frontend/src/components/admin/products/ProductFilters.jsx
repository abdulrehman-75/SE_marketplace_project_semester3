"use client"

import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"

const ProductFilters = ({ filters, setFilters, onApply, onReset, categories = [] }) => {
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.categoryName, label: cat.categoryName })),
  ]

  const stockOptions = [
    { value: "", label: "All Stock Status" },
    { value: "true", label: "In Stock" },
    { value: "false", label: "Out of Stock" },
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
          placeholder="Search products..."
          value={filters.SearchTerm || ""}
          onChange={(e) => setFilters({ ...filters, SearchTerm: e.target.value })}
        />

        <Select
          options={categoryOptions}
          value={filters.Category || ""}
          onChange={(e) => setFilters({ ...filters, Category: e.target.value })}
        />

        <Input
          placeholder="Min Price"
          type="number"
          value={filters.MinPrice || ""}
          onChange={(e) => setFilters({ ...filters, MinPrice: e.target.value })}
        />

        <Input
          placeholder="Max Price"
          type="number"
          value={filters.MaxPrice || ""}
          onChange={(e) => setFilters({ ...filters, MaxPrice: e.target.value })}
        />

        <Input
          placeholder="Seller ID"
          type="number"
          value={filters.SellerId || ""}
          onChange={(e) => setFilters({ ...filters, SellerId: e.target.value })}
        />

        <Select
          options={stockOptions}
          value={filters.InStock || ""}
          onChange={(e) => setFilters({ ...filters, InStock: e.target.value })}
        />

        <Select
          options={activeOptions}
          value={filters.IsActive || ""}
          onChange={(e) => setFilters({ ...filters, IsActive: e.target.value })}
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

export default ProductFilters
