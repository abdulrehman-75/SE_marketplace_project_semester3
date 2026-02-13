// pages/dashboards/DeliveryStaffDashboard.jsx
"use client"

import { useState, useCallback } from "react"
import DeliveryStaffLayout from "../../components/delivery/DeliveryStaffLayout"
import DashboardOverview from "../../components/delivery/dashboard/DashboardOverview"
import AvailableOrders from "../../components/delivery/orders/AvailableOrders"
import MyDeliveries from "../../components/delivery/orders/MyDeliveries"
import DeliveryDetail from "../../components/delivery/orders/DeliveryDetail"
import DeliveryHistory from "../../components/delivery/history/DeliveryHistory"
import DeliveryProfile from "../../components/delivery/profile/DeliveryProfile"

const DeliveryStaffDashboard = () => {
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

  const handleSelectOrder = useCallback((id) => {
    handleNavigation("order-detail", id)
  }, [handleNavigation])

  const handleSelectDelivery = useCallback((id) => {
    handleNavigation("delivery-detail", id)
  }, [handleNavigation])

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview 
            onNavigate={setActiveSection}
          />
        )
      
      case "available-orders":
        return (
          <AvailableOrders 
            onSelectOrder={handleSelectOrder}
          />
        )
      
      case "order-detail":
        return (
          <DeliveryDetail 
            deliveryId={selectedId}
            onBack={handleBack}
          />
        )
      
      case "my-deliveries":
        return (
          <MyDeliveries 
            onSelectDelivery={handleSelectDelivery}
          />
        )
      
      case "delivery-detail":
        return (
          <DeliveryDetail 
            deliveryId={selectedId}
            onBack={handleBack}
          />
        )
      
      case "history":
        return <DeliveryHistory />
      
      case "profile":
        return <DeliveryProfile />
      
      default:
        return (
          <DashboardOverview 
            onNavigate={setActiveSection}
          />
        )
    }
  }

  return (
    <DeliveryStaffLayout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
    >
      {renderSection()}
    </DeliveryStaffLayout>
  )
}

export default DeliveryStaffDashboard