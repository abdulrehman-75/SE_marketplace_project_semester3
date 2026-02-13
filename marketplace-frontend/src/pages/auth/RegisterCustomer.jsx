"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCustomerSchema } from "../../utils/validators";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayouts";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Select from "../../components/common/Select";
import ErrorMessage from "../../components/common/ErrorMessage";
import authService from "../../services/authService";
import { PHONE_PREFIXES, CITIES } from "../../utils/constants";

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("+92");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      shippingAddress: "",
      city: "",
      postalCode: "",
      country: "Pakistan",
    },
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      setIsLoading(true);

      // Combine phone prefix with phone number
      const phoneWithPrefix = data.phone ? `${phonePrefix}${data.phone}` : "";

      const response = await authService.registerCustomer({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phone: phoneWithPrefix,
        shippingAddress: data.shippingAddress,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      });

      // Auto-login after successful registration
      if (response.success) {
        const loginResult = await login(data.email, data.password);
        if (loginResult.success && loginResult.redirectTo) {
          navigate(loginResult.redirectTo, { replace: true });
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-8 bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Register as Customer
          </h1>
          <p className="text-gray-600">
            Create your customer account to start shopping
          </p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} className="mb-6" />}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register("fullName")}
            error={errors.fullName?.message}
            disabled={isLoading}
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            error={errors.email?.message}
            disabled={isLoading}
          />

          {/* Phone Number with Prefix */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Phone Number (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg w-28 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              >
                {PHONE_PREFIXES.map((prefix) => (
                  <option key={prefix.value} value={prefix.value}>
                    {prefix.label}
                  </option>
                ))}
              </select>

              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="3001234567"
                  {...register("phone")}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Shipping Address */}
          <Input
            label="Shipping Address (Optional)"
            type="text"
            placeholder="Enter your shipping address"
            {...register("shippingAddress")}
            error={errors.shippingAddress?.message}
            disabled={isLoading}
          />

          {/* City Dropdown */}
          <Select
            label="City (Optional)"
            {...register("city")}
            error={errors.city?.message}
            disabled={isLoading}
            options={[
              { value: "", label: "Select City" },
              ...CITIES,
            ]}
          />

          {/* Postal Code */}
          <Input
            label="Postal Code (Optional)"
            type="text"
            placeholder="Enter postal code"
            {...register("postalCode")}
            error={errors.postalCode?.message}
            disabled={isLoading}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            {...register("password")}
            error={errors.password?.message}
            disabled={isLoading}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Register
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Already have an account? Return to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterCustomer;