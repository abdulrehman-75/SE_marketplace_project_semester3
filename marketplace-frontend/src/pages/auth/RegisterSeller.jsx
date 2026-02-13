"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSellerSchema } from "../../utils/validators";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayouts";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Select from "../../components/common/Select";
import ErrorMessage from "../../components/common/ErrorMessage";
import authService from "../../services/authService";
import { PHONE_PREFIXES, CITIES } from "../../utils/constants";

const RegisterSeller = () => {
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
    resolver: zodResolver(registerSellerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      shopName: "",
      contactPhone: "",
      address: "",
      shopDescription: "",
      businessRegistrationNumber: "",
      city: "",
      country: "Pakistan",
    },
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      setIsLoading(true);

      // Combine phone prefix with phone number
      const phoneWithPrefix = data.contactPhone ? `${phonePrefix}${data.contactPhone}` : "";

      const response = await authService.registerSeller({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        shopName: data.shopName,
        contactPhone: phoneWithPrefix,
        address: data.address,
        shopDescription: data.shopDescription,
        businessRegistrationNumber: data.businessRegistrationNumber,
        city: data.city,
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
            Register as Seller
          </h1>
          <p className="text-gray-600">
            Create your seller account to start selling
          </p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} className="mb-6" />}

        {/* Registration Form */}
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

          {/* Shop Name */}
          <Input
            label="Shop Name"
            type="text"
            placeholder="Enter your shop name"
            {...register("shopName")}
            error={errors.shopName?.message}
            disabled={isLoading}
          />

          {/* Contact Phone with Prefix */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contact Phone (Optional)
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
                  {...register("contactPhone")}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.contactPhone
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
              </div>
            </div>
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
            )}
          </div>

          {/* Business Address */}
          <Input
            label="Business Address (Optional)"
            type="text"
            placeholder="Enter your business address"
            {...register("address")}
            error={errors.address?.message}
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

          {/* Shop Description */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Shop Description (Optional)
            </label>
            <textarea
              {...register("shopDescription")}
              placeholder="Tell customers about your shop"
              rows={3}
              disabled={isLoading}
              className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.shopDescription
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {errors.shopDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.shopDescription.message}</p>
            )}
          </div>

          {/* Business Registration Number */}
          <Input
            label="Business Registration Number (Optional)"
            type="text"
            placeholder="Enter registration number"
            {...register("businessRegistrationNumber")}
            error={errors.businessRegistrationNumber?.message}
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

export default RegisterSeller;