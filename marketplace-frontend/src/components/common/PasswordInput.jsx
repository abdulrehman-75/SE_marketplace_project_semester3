"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const PasswordInput = forwardRef(({ label, error, className = "", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"

export default PasswordInput
