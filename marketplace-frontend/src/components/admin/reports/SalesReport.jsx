"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Input from "../../common/Input"
import Select from "../../common/Select"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import Loader from "../../common/Loader"
import adminService from "../../../services/adminService"

const SalesReport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportData, setReportData] = useState(null)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
      groupBy: "Day",
    },
  })

  const groupByOptions = [
    { value: "Day", label: "Daily" },
    { value: "Week", label: "Weekly" },
    { value: "Month", label: "Monthly" },
    { value: "Year", label: "Yearly" },
  ]

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.generateSalesReport({
        fromDate: new Date(data.fromDate).toISOString(),
        toDate: new Date(data.toDate).toISOString(),
        sellerId: data.sellerId ? Number.parseInt(data.sellerId) : null,
        categoryId: data.categoryId ? Number.parseInt(data.categoryId) : null,
        groupBy: data.groupBy,
      })
      if (response.data.success) {
        setReportData(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales Report & Analytics</h1>

      {error && <ErrorMessage message={error} />}

      {/* Report Form */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Generate Report</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input label="From Date" type="date" {...register("fromDate")} />
            <Input label="To Date" type="date" {...register("toDate")} />
            <Input label="Seller ID (Optional)" type="number" placeholder="Enter seller ID" {...register("sellerId")} />
            <Select label="Group By" options={groupByOptions} {...register("groupBy")} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </form>
      </div>

      {loading && <Loader fullScreen />}

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {reportData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders}</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.completedOrders}</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {reportData.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Sellers */}
          {reportData.topSellers && reportData.topSellers.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Sellers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Shop Name</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Total Sales</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Total Orders</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.topSellers.map((seller) => (
                      <tr key={seller.sellerId}>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{seller.shopName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          Rs. {seller.totalSales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{seller.totalOrders}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {seller.averageRating.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Categories */}
          {reportData.topCategories && reportData.topCategories.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Categories</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Products</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.topCategories.map((category) => (
                      <tr key={category.categoryId}>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {category.categoryName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{category.totalProducts}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          Rs. {category.totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{category.totalOrders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SalesReport
