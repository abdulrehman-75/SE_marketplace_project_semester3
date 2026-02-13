// pages/dashboards/SellerDashboard.jsx
"use client"

import { useState, useCallback } from "react"
import SellerLayout from "../../components/seller/SellerLayout"
import DashboardOverview from "../../components/seller/dashboard/DashboardOverview"
import ProductsManagement from "../../components/seller/products/ProductsManagement"
import ProductDetail from "../../components/seller/products/ProductDetail"
import CreateProduct from "../../components/seller/products/CreateProduct"
import OrdersManagement from "../../components/seller/orders/OrdersManagement"
import OrderDetail from "../../components/seller/orders/OrderDetail"
import PaymentsManagement from "../../components/seller/payments/PaymentsManagement"
import PaymentDetail from "../../components/seller/payments/PaymentDetail"
import FollowersManagement from "../../components/seller/followers/FollowersManagement"
import ShopProfile from "../../components/seller/profile/ShopProfile"

const SellerDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedId, setSelectedId] = useState(null)
  const [navigationStack, setNavigationStack] = useState([])

  const handleNavigation = useCallback((section, id = null) => {
    // Save current state to navigation stack
    setNavigationStack((prev) => [...prev, { section: activeSection, id: selectedId }])
    setActiveSection(section)
    setSelectedId(id)
  }, [activeSection, selectedId])

  const handleBack = useCallback(() => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1]
      setNavigationStack((prev) => prev.slice(0, -1))
      setActiveSection(previous.section)
      setSelectedId(previous.id)
    } else {
      // Default fallback
      setActiveSection("dashboard")
      setSelectedId(null)
    }
  }, [navigationStack])

  const handleSelectProduct = useCallback((id) => {
    handleNavigation("product-detail", id)
  }, [handleNavigation])

  const handleCreateProduct = useCallback(() => {
    handleNavigation("create-product")
  }, [handleNavigation])

  const handleSelectOrder = useCallback((id) => {
    handleNavigation("order-detail", id)
  }, [handleNavigation])

  const handleSelectPayment = useCallback((id) => {
    handleNavigation("payment-detail", id)
  }, [handleNavigation])

  const handleProductSuccess = useCallback(() => {
    setActiveSection("products")
    setSelectedId(null)
    setNavigationStack([])
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview
            onNavigate={setActiveSection}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
            onSelectPayment={handleSelectPayment}
          />
        )
      case "products":
        return (
          <ProductsManagement 
            onSelectProduct={handleSelectProduct} 
            onCreateProduct={handleCreateProduct} 
          />
        )
      case "product-detail":
        return (
          <ProductDetail 
            productId={selectedId} 
            onBack={handleBack} 
          />
        )
      case "create-product":
        return (
          <CreateProduct 
            onBack={handleBack} 
            onSuccess={handleProductSuccess} 
          />
        )
      case "orders":
        return (
          <OrdersManagement 
            onSelectOrder={handleSelectOrder} 
          />
        )
      case "order-detail":
        return (
          <OrderDetail 
            orderId={selectedId} 
            onBack={handleBack} 
          />
        )
      case "payments":
        return (
          <PaymentsManagement 
            onSelectPayment={handleSelectPayment} 
          />
        )
      case "payment-detail":
        return (
          <PaymentDetail 
            paymentId={selectedId} 
            onBack={handleBack} 
          />
        )
      case "followers":
        return <FollowersManagement />
      case "profile":
        return <ShopProfile />
      default:
        return (
          <DashboardOverview 
            onNavigate={setActiveSection}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
            onSelectPayment={handleSelectPayment}
          />
        )
    }
  }

  return (
    <SellerLayout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
    >
      {renderSection()}
    </SellerLayout>
  )
}

export default SellerDashboard