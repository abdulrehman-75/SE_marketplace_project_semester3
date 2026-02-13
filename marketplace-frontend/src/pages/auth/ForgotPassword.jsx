"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema } from "../../utils/validators"
import authService from "../../services/authService"
import AuthLayout from "../../layouts/AuthLayouts"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import ErrorMessage from "../../components/common/ErrorMessage"
import { CheckCircle, ArrowLeft } from "lucide-react"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data) => {
    try {
      setError("")
      setSuccess(false)
      setIsLoading(true)

      const response = await authService.forgotPassword(data.email)

      if (response.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToReset = () => {
    navigate("/reset-password", { 
      state: { email: getValues("email") }
    })
  }

  return (
    <AuthLayout>
      <div className="p-8 bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email to receive a verification code</p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Check Your Email</h2>
              <p className="mb-1 text-sm text-center text-gray-600">We've sent a 6-digit verification code to</p>
              <p className="mb-4 text-sm font-medium text-gray-900">{getValues("email")}</p>
              <p className="text-xs text-center text-gray-500">The code will expire in 15 minutes.</p>
            </div>

            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
              <p className="text-sm text-center text-blue-800">
                Use the verification code to reset your password. Check your spam folder if you don't see the email.
              </p>
            </div>

            {/* Continue to Reset Password Button */}
            <Button 
              onClick={handleContinueToReset} 
              variant="primary" 
              className="w-full"
            >
              Continue to Reset Password
            </Button>

            <Link to="/login">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && <ErrorMessage message={error} className="mb-6" />}

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                error={errors.email?.message}
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                Send Verification Code
              </Button>

              {/* Back to Login Link */}
              <Link to="/login">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>

            {/* Info */}
            <div className="p-3 mt-6 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-xs text-center text-gray-600">
                Enter the email address associated with your account and we'll send you a verification code to reset
                your password.
              </p>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword