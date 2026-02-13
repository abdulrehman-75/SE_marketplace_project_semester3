"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, X } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function Cart({
  onNavigate,
  onSelectProduct,
  onSelectOrder,
  previousSection = "products",
}) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await customerService.getCart()
      setCart(response.data)
    } catch (error) {
      console.error("[v0] Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      setUpdating(true)
      await customerService.updateCartItem(cartItemId, newQuantity)
      await fetchCart()
    } catch (error) {
      console.error("[v0] Error updating quantity:", error)
      alert(error.message || "Failed to update quantity")
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      setUpdating(true)
      await customerService.removeCartItem(cartItemId)
      await fetchCart()
    } catch (error) {
      console.error("[v0] Error removing item:", error)
      alert(error.message || "Failed to remove item")
    } finally {
      setUpdating(false)
    }
  }

  const clearCart = async () => {
    try {
      setUpdating(true)
      await customerService.clearCart()
      setShowClearModal(false)
      await fetchCart()
    } catch (error) {
      console.error("[v0] Error clearing cart:", error)
      alert(error.message || "Failed to clear cart")
    } finally {
      setUpdating(false)
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
    return (
      <div className="p-12 text-center bg-white rounded-lg shadow">
        <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mb-6 text-gray-600">Add some products to get started!</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => onNavigate("products")}>
            Browse Products
          </Button>
          {previousSection !== "cart" && previousSection !== "products" && (
            <Button variant="outline" onClick={() => onNavigate(previousSection)}>
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate(previousSection)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Close cart"
          >
            <X size={24} className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowClearModal(true)}
          className="text-red-600 border-red-600"
        >
          <Trash2 size={18} className="mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div key={item.cartItemId} className="p-4 bg-white rounded-lg shadow">
              {!item.isActive && (
                <div className="flex items-center gap-2 p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle size={18} className="text-red-600" />
                  <p className="text-sm text-red-700">
                    This product is no longer available
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => onSelectProduct(item.productId)}
                  className="flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-100 rounded-lg"
                >
                  <img
                    src={item.productImage || "/placeholder.svg?height=96&width=96"}
                    alt={item.productName}
                    className="object-cover w-full h-full"
                  />
                </button>

                <div className="flex-1">
                  <button
                    onClick={() => onSelectProduct(item.productId)}
                    className="font-semibold text-left text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {item.productName}
                  </button>
                  <p className="mt-1 text-sm text-gray-600">
                    Seller: {item.sellerShopName}
                  </p>
                  <p className="mt-2 text-lg font-bold text-blue-600">
                    Rs. {item.price.toLocaleString()}
                  </p>

                  {item.stockQuantity === 0 && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      Out of stock
                    </p>
                  )}
                  {item.quantity > item.stockQuantity && item.stockQuantity > 0 && (
                    <p className="mt-1 text-sm text-orange-600">
                      Only {item.stockQuantity} available
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    disabled={updating}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity - 1)
                      }
                      disabled={updating || item.quantity <= 1}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 font-medium text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity + 1)
                      }
                      disabled={
                        updating || item.quantity >= item.stockQuantity
                      }
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Subtotal:{" "}
                    <span className="font-semibold">
                      Rs. {item.subtotal.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="pb-4 mb-4 space-y-3 border-b border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Buyer Protection Fee (2%)</span>
                <span>
                  Rs. {cart.buyerProtectionFee.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
              <span>Grand Total</span>
              <span>Rs. {cart.grandTotal.toLocaleString()}</span>
            </div>

            <Button
              onClick={() => onNavigate("checkout")}
              className="w-full mb-3"
              disabled={cart.items.some(
                (item) => !item.isActive || item.stockQuantity === 0
              )}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate(previousSection)}
              className="w-full"
            >
              Continue Shopping
            </Button>

            {cart.items.some(
              (item) => !item.isActive || item.stockQuantity === 0
            ) && (
              <p className="mt-3 text-sm text-center text-red-600">
                Remove unavailable items to proceed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Clear Cart?
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to remove all items from your cart?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={clearCart}
                disabled={updating}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {updating ? <Loader /> : "Clear Cart"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}