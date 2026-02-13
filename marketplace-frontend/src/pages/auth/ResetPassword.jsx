"use client"

import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "../../utils/validators"
import authService from "../../services/authService"
import AuthLayout from "../../layouts/AuthLayouts"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import PasswordInput from "../../components/common/PasswordInput"
import ErrorMessage from "../../components/common/ErrorMessage"
import { CheckCircle, ArrowLeft } from "lucide-react"

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get email from navigation state
  const emailFromState = location.state?.email || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromState,
      verificationCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    try {
      setError("")
      setSuccess(false)
      setIsLoading(true)

      const response = await authService.resetPassword(
        data.email,
        data.verificationCode,
        data.newPassword,
        data.confirmPassword
      )

      if (response.success) {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", { replace: true })
        }, 2000)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reset password. Please check your verification code and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8 bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600">Enter the verification code and your new password</p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Password Reset Successful!</h2>
              <p className="mb-4 text-sm text-center text-gray-600">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && <ErrorMessage message={error} className="mb-6" />}

            {/* Reset Password Form */}
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

              {/* Verification Code */}
              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                {...register("verificationCode")}
                error={errors.verificationCode?.message}
                disabled={isLoading}
                maxLength={6}
              />

              {/* New Password */}
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                disabled={isLoading}
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                Reset Password
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
                Enter the 6-digit verification code sent to your email. The code expires in 15 minutes.
              </p>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export default ResetPassword