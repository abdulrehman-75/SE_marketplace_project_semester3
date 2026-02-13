"use client"

import { useState } from "react"
import InventoryLayout from "../../components/Inventory/InventoryLayout"
import DashboardOverview from "../../components/inventory/dashboard/DashboardOverview"
import InventoryManagement from "../../components/inventory/inventory/InventoryManagement"
import ProductDetail from "../../components/inventory/inventory/ProductDetail"
import StockAlerts from "../../components/inventory/alerts/StockAlerts"
import BulkUpdate from "../../components/inventory/bulk/BulkUpdate"
import StockHistory from "../../components/inventory/history/StockHistory"
import ManagerProfile from "../../components/inventory/profile/ManagerProfile"

const InventoryDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [productId, setProductId] = useState(null)
  const [previousSection, setPreviousSection] = useState(null)

  const handleNavigation = (section) => {
    setPreviousSection(activeSection)
    setActiveSection(section)
  }

  const handleSelectProduct = (id) => {
    setPreviousSection(activeSection)
    setProductId(id)
    setActiveSection("product-detail")
  }

  const handleBack = () => {
    if (previousSection) {
      setActiveSection(previousSection)
      setPreviousSection(null)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview onNavigate={handleNavigation} onSelectProduct={handleSelectProduct} />
      case "inventory":
        return <InventoryManagement onSelectProduct={handleSelectProduct} />
      case "product-detail":
        return <ProductDetail productId={productId} onBack={handleBack} />
      case "alerts":
        return <StockAlerts onSelectProduct={handleSelectProduct} />
      case "bulk-update":
        return <BulkUpdate />
      case "history":
        return <StockHistory onSelectProduct={handleSelectProduct} />
      case "profile":
        return <ManagerProfile />
      default:
        return <DashboardOverview onNavigate={handleNavigation} />
    }
  }

  return (
    <InventoryLayout activeSection={activeSection} setActiveSection={handleNavigation}>
      {renderSection()}
    </InventoryLayout>
  )
}

export default InventoryDashboard
