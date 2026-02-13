"use client"

import { useState, useEffect } from "react"
import CustomerLayout from "../../components/customer/layout/CustomerLayout"
import DashboardOverview from "../../components/customer/dashboard/DashboardOverview"
import ProductListing from "../../components/customer/products/ProductListing"
import ProductDetail from "../../components/customer/products/ProductDetail"
import Cart from "../../components/customer/cart/Cart"
import Checkout from "../../components/customer/cart/Checkout"
import OrderHistory from "../../components/customer/orders/OrderHistory"
import OrderDetail from "../../components/customer/orders/OrderDetail"
import ReviewList from "../../components/customer/reviews/ReviewList"
import FollowedSellers from "../../components/customer/following/FollowedSellers"
import FollowedFeed from "../../components/customer/following/FollowedFeed"
import Profile from "../../components/customer/profile/Profile"
import ComplaintsList from "../../components/customer/complaints/ComplaintList"
import ComplaintDetail from "../../components/customer/complaints/ComplaintDetail"

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState("products")
  const [previousSection, setPreviousSection] = useState("products")
  const [productId, setProductId] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [complaintId, setComplaintId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ FIXED: Track previous section properly for back navigation
  const handleNavigation = (newSection) => {
    // Save current section as previous before navigating
    // Don't track product-detail, order-detail, complaint-detail, cart, or checkout as previous sections
    const skipSections = ["product-detail", "order-detail", "complaint-detail", "cart", "checkout"]
    
    if (!skipSections.includes(activeSection)) {
      setPreviousSection(activeSection)
    }
    
    setActiveSection(newSection)
  }

  // ✅ NEW: Handle search from layout
  const handleSearch = (query) => {
    setSearchQuery(query)
    setActiveSection("products")
  }

  // ✅ FIXED: Handle product selection with proper back tracking
  const handleSelectProduct = (id) => {
    setProductId(id)
    handleNavigation("product-detail")
  }

  // ✅ FIXED: Handle order selection with proper back tracking
  const handleSelectOrder = (id) => {
    setOrderId(id)
    handleNavigation("order-detail")
  }

  // ✅ NEW: Handle complaint selection
  const handleSelectComplaint = (id) => {
    setComplaintId(id)
    handleNavigation("complaint-detail")
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview onNavigate={handleNavigation} />
      
      case "products":
        return (
          <ProductListing 
            onNavigate={handleNavigation} 
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
            searchQuery={searchQuery}
            onSearchComplete={() => setSearchQuery("")}
          />
        )
      
      case "product-detail":
        return (
          <ProductDetail 
            productId={productId} 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
            previousSection={previousSection}
          />
        )
      
      case "cart":
        return (
          <Cart 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
            previousSection={previousSection}
          />
        )
      
      case "checkout":
        return (
          <Checkout 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "orders":
        return (
          <OrderHistory 
            onNavigate={handleNavigation} 
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "order-detail":
        return (
          <OrderDetail 
            orderId={orderId} 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "reviews":
        return (
          <ReviewList 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
          />
        )
      
      case "followed":
        return (
          <FollowedSellers 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "followed-feed":
        return (
          <FollowedFeed 
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "complaints":
        return (
          <ComplaintsList 
            onNavigate={handleNavigation}
            onSelectComplaint={handleSelectComplaint}
          />
        )
      
      case "complaint-detail":
        return (
          <ComplaintDetail 
            complaintId={complaintId}
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
          />
        )
      
      case "profile":
        return <Profile onNavigate={handleNavigation} />
      
      default:
        return (
          <ProductListing 
            onNavigate={handleNavigation} 
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            onSearchComplete={() => setSearchQuery("")}
          />
        )
    }
  }

  return (
    <CustomerLayout 
      activeSection={activeSection} 
      setActiveSection={handleNavigation}
      onSearch={handleSearch}
    >
      {renderSection()}
    </CustomerLayout>
  )
}

export default CustomerDashboard