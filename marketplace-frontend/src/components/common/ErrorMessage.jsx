import { AlertCircle } from "lucide-react"

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null

  return (
    <div className={`flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  )
}

export default ErrorMessage
