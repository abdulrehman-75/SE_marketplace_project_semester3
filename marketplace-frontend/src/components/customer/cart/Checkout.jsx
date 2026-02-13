"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreditCard, MapPin, Package, ArrowLeft } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Input from "../../common/Input"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import { CITIES } from "../../../utils/constants"

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, "Address must be at least 10 characters"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryPostalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  customerPhone: z.string().regex(/^\+92\d{10}$/, "Phone must be in format +92XXXXXXXXXX"),
})

export default function Checkout({
  onNavigate,
  onSelectProduct,
  onSelectOrder,
}) {
  const [cart, setCart] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cartData, profileData] = await Promise.all([
        customerService.getCart(),
        customerService.getProfile(),
      ])

      setCart(cartData.data)
      setProfile(profileData.data)

      setValue("deliveryAddress", profileData.data.shippingAddress || "")
      setValue("deliveryCity", profileData.data.city || "")
      setValue("deliveryPostalCode", profileData.data.postalCode || "")
      setValue("customerPhone", profileData.data.phone || "")
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to load checkout data")
      onNavigate("cart")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const response = await customerService.createOrder(data)
      alert("Order placed successfully!")
      
      if (onSelectOrder && response.data?.orderId) {
        onSelectOrder(response.data.orderId)
        onNavigate("order-detail")
      } else {
        onNavigate("orders")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert(error.message || "Failed to place order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    onNavigate("cart")
    return null
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate("cart")}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  label="Delivery Address"
                  {...register("deliveryAddress")}
                  placeholder="House #, Street, Area"
                />
                {errors.deliveryAddress && (
                  <ErrorMessage message={errors.deliveryAddress.message} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    City
                  </label>
                  <select
                    {...register("deliveryCity")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryCity && (
                    <ErrorMessage message={errors.deliveryCity.message} />
                  )}
                </div>

                <div>
                  <Input
                    label="Postal Code"
                    {...register("deliveryPostalCode")}
                    placeholder="54000"
                    maxLength={5}
                  />
                  {errors.deliveryPostalCode && (
                    <ErrorMessage message={errors.deliveryPostalCode.message} />
                  )}
                </div>
              </div>

              <div>
                <Input
                  label="Phone Number"
                  {...register("customerPhone")}
                  placeholder="+923001234567"
                />
                {errors.customerPhone && (
                  <ErrorMessage message={errors.customerPhone.message} />
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 mb-6">
              <Package size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Order Review
              </h2>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <img
                    src={item.productImage || "/placeholder.svg?height=80&width=80"}
                    alt={item.productName}
                    className="object-cover w-20 h-20 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 line-clamp-2">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rs. {item.price.toLocaleString()} each
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rs. {item.subtotal.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Payment Method
              </h2>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div>
                <p className="font-semibold text-gray-900">
                  Cash on Delivery
                </p>
                <p className="text-sm text-gray-600">
                  Pay when you receive your order
                </p>
              </div>
              <span className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                Selected
              </span>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="pb-4 mb-4 space-y-3 border-b border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Buyer Protection Fee</span>
                <span>Rs. {cart.buyerProtectionFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>Rs. {cart.grandTotal.toLocaleString()}</span>
            </div>

            <Button 
              onClick={handleSubmit(onSubmit)} 
              disabled={submitting} 
              className="w-full mb-3"
            >
              {submitting ? <Loader /> : "Place Order"}
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate("cart")}
              className="w-full"
              disabled={submitting}
            >
              Back to Cart
            </Button>

            <p className="mt-4 text-xs text-center text-gray-600">
              By placing your order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}