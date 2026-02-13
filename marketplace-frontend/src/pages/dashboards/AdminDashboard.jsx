"use client"

import { useState, useCallback } from "react"
import AdminLayout from "../../components/admin/layout/AdminLayout"
import DashboardOverview from "../../components/admin/dashboard/DashboardOverview"
import SellersList from "../../components/admin/sellers/SellersList"
import CustomersList from "../../components/admin/customers/CustomersList"
import OrdersList from "../../components/admin/orders/OrdersList"
import PaymentsList from "../../components/admin/payments/PaymentsList"
import CategoriesList from "../../components/admin/categories/CategoriesList"
import ProductsList from "../../components/admin/products/ProductsList"
import ReviewsList from "../../components/admin/reviews/ReviewsList"
import StaffManagement from "../../components/admin/staff/StaffManagement"
import StaffRegistration from "../../components/admin/staff-registration/StaffRegistration"
import ComplaintsList from "../../components/admin/complaints/ComplaintsList"
import SalesReport from "../../components/admin/reports/SalesReport"
import SystemConfig from "../../components/admin/config/SystemConfig"

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [previousSection, setPreviousSection] = useState("dashboard")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Track previous section for better navigation
  const handleNavigation = useCallback((newSection) => {
    // Don't track modals or temporary sections as previous
    const nonTrackableSections = []
    
    if (!nonTrackableSections.includes(activeSection)) {
      setPreviousSection(activeSection)
    }
    setActiveSection(newSection)
  }, [activeSection])

  // Trigger refresh for current section
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const renderSection = () => {
    const commonProps = {
      onNavigate: handleNavigation,
      onRefresh: handleRefresh,
      refreshTrigger,
    }

    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview {...commonProps} />
      
      case "sellers":
        return <SellersList {...commonProps} />
      
      case "customers":
        return <CustomersList {...commonProps} />
      
      case "orders":
        return <OrdersList {...commonProps} />
      
      case "payments":
        return <PaymentsList {...commonProps} />
      
      case "categories":
        return <CategoriesList {...commonProps} />
      
      case "products":
        return <ProductsList {...commonProps} />
      
      case "reviews":
        return <ReviewsList {...commonProps} />
      
      case "staff-delivery":
      case "staff-support":
      case "staff-inventory":
        return <StaffManagement staffType={activeSection} {...commonProps} />
      
      case "register-staff":
        return <StaffRegistration {...commonProps} />
      
      case "complaints":
        return <ComplaintsList {...commonProps} />
      
      case "reports":
        return <SalesReport {...commonProps} />
      
      case "config":
        return <SystemConfig {...commonProps} />
      
      default:
        return <DashboardOverview {...commonProps} />
    }
  }

  return (
    <AdminLayout 
      activeSection={activeSection} 
      setActiveSection={handleNavigation}
      previousSection={previousSection}
    >
      {renderSection()}
    </AdminLayout>
  )
}

export default AdminDashboard