"use client"

import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"

const OrderFilters = ({ filters, setFilters, onApply, onReset }) => {
  const orderStatusOptions = [
    { value: "", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "PickedUp", label: "Picked Up" },
    { value: "OnTheWay", label: "On The Way" },
    { value: "Delivered", label: "Delivered" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Disputed", label: "Disputed" },
  ]

  const paymentStatusOptions = [
    { value: "", label: "All Payment Status" },
    { value: "Pending", label: "Pending" },
    { value: "VerificationPeriod", label: "Verification Period" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Released", label: "Released" },
    { value: "Frozen", label: "Frozen" },
    { value: "Disputed", label: "Disputed" },
  ]

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Customer ID..."
          type="number"
          value={filters.CustomerId || ""}
          onChange={(e) => setFilters({ ...filters, CustomerId: e.target.value })}
        />

        <Input
          placeholder="Seller ID..."
          type="number"
          value={filters.SellerId || ""}
          onChange={(e) => setFilters({ ...filters, SellerId: e.target.value })}
        />

        <Select
          options={orderStatusOptions}
          value={filters.OrderStatus || ""}
          onChange={(e) => setFilters({ ...filters, OrderStatus: e.target.value })}
        />

        <Select
          options={paymentStatusOptions}
          value={filters.PaymentStatus || ""}
          onChange={(e) => setFilters({ ...filters, PaymentStatus: e.target.value })}
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

export default OrderFilters
