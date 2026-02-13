"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../utils/validators";
import { ACTOR_TYPES } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayouts";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Select from "../../components/common/Select";
import ErrorMessage from "../../components/common/ErrorMessage";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      actorType: "",
    },
  });

 const onSubmit = async (data) => {
  try {
    console.log("🔐 LOGIN ATTEMPT STARTED");
    setError("")
    setIsLoading(true)

    const result = await login(data.email, data.password)
    console.log("✅ LOGIN RESULT:", result);

    if (result.success && result.redirectTo) {
      console.log("🚀 NAVIGATING TO:", result.redirectTo);
      navigate(result.redirectTo, { replace: true })
    }
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    setError(err.message || "Invalid email or password. Please try again.")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <AuthLayout>
      <div className="p-8 bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to access your marketplace account
          </p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} className="mb-6" />}

        {/* Login Form */}
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

          {/* Password */}
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            {...register("password")}
            error={errors.password?.message}
            disabled={isLoading}
          />

          {/* Actor Type (UI only) */}
          <Select
            label="Login As (Optional)"
            options={ACTOR_TYPES}
            placeholder="Select your role"
            {...register("actorType")}
            error={errors.actorType?.message}
            disabled={isLoading}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        {/* Note */}
        <div className="p-3 mt-6 border border-blue-100 rounded-lg bg-blue-50">
          <p className="text-xs text-center text-blue-800">
            Your actual role is determined by the backend. The role selector
            above is for UI reference only.
          </p>
        </div>

        {/* Registration Section */}
        <div className="pt-6 mt-8 border-t border-gray-200">
          <p className="mb-4 text-sm text-center text-gray-600">
            New to our marketplace?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => navigate("/register/customer")}
              className="flex-1"
              disabled={isLoading}
            >
              Register as Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/register/seller")}
              className="flex-1"
              disabled={isLoading}
            >
              Register as Seller
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
