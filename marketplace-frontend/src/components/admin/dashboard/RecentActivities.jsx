import { formatDistanceToNow } from "date-fns"

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activities</h3>
        <p className="py-8 text-center text-gray-500">No recent activities</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.activityType}</p>
              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivities