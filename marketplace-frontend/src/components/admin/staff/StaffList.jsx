"use client"

import { Edit } from "lucide-react"

const StaffList = ({ staff, loading, onUpdateStatus }) => {
  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading staff...</div>
  }

  if (staff.length === 0) {
    return <div className="py-8 text-center text-gray-500">No staff members found</div>
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employee Code</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date Joined</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.staffId} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{member.fullName}</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{member.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{member.phone}</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{member.employeeCode}</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                {new Date(member.dateJoined).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <button
                  onClick={() => onUpdateStatus(member)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                  Update Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StaffList
