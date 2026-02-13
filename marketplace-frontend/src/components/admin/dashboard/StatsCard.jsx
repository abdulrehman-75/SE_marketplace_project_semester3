const StatsCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "border-blue-600 text-blue-600",
    green: "border-green-600 text-green-600",
    yellow: "border-yellow-600 text-yellow-600",
    purple: "border-purple-600 text-purple-600",
    red: "border-red-600 text-red-600",
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && <Icon className={`w-12 h-12 ${colorClasses[color]}`} />}
      </div>
    </div>
  )
}

export default StatsCard
