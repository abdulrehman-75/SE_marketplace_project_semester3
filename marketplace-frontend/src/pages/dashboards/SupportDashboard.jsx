// pages/dashboards/SupportStaffDashboard.jsx
"use client"

import { useState, useCallback } from "react"
import SupportStaffLayout from "../../components/supportStaff/SupportStaffLayout"
import DashboardOverview from "../../components/supportStaff/dashboard/DashboardOverview"
import ComplaintsManagement from "../../components/supportStaff/complaints/ComplaintsManagement"
import ComplaintDetail from "../../components/supportStaff/complaints/ComplaintDetail"
import StatisticsView from "../../components/supportStaff/statistics/StatisticsView"
import SupportStaffProfile from "../../components/supportStaff/profile/SupportStaffProfile"

const SupportStaffDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedComplaintId, setSelectedComplaintId] = useState(null)
  const [navigationStack, setNavigationStack] = useState([])

  const handleNavigation = useCallback((section, complaintId = null) => {
    // Save current state to navigation stack
    setNavigationStack((prev) => [...prev, { section: activeSection, complaintId: selectedComplaintId }])
    setActiveSection(section)
    setSelectedComplaintId(complaintId)
  }, [activeSection, selectedComplaintId])

  const handleBack = useCallback(() => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1]
      setNavigationStack((prev) => prev.slice(0, -1))
      setActiveSection(previous.section)
      setSelectedComplaintId(previous.complaintId)
    } else {
      // Default fallback
      setActiveSection("dashboard")
      setSelectedComplaintId(null)
    }
  }, [navigationStack])

  const handleSelectComplaint = useCallback((complaintId) => {
    handleNavigation("complaint-detail", complaintId)
  }, [handleNavigation])

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview
            onNavigate={setActiveSection}
            onSelectComplaint={handleSelectComplaint}
          />
        )
      case "complaints":
        return (
          <ComplaintsManagement
            onSelectComplaint={handleSelectComplaint}
          />
        )
      case "complaint-detail":
        return (
          <ComplaintDetail
            complaintId={selectedComplaintId}
            onBack={handleBack}
          />
        )
      case "statistics":
        return <StatisticsView />
      case "profile":
        return <SupportStaffProfile />
      default:
        return (
          <DashboardOverview
            onNavigate={setActiveSection}
            onSelectComplaint={handleSelectComplaint}
          />
        )
    }
  }

  return (
    <SupportStaffLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      {renderSection()}
    </SupportStaffLayout>
  )
}

export default SupportStaffDashboard