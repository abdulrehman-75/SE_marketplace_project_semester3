// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


// User Roles - MUST match backend exactly
export const USER_ROLES = {
  ADMIN: "Admin",
  SELLER: "Seller",
  CUSTOMER: "Customer",
  DELIVERY_STAFF: "DeliveryStaff",
  SUPPORT_STAFF: "SupportStaff",
  INVENTORY_MANAGER: "InventoryManager",
}

// Role Display Names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.SELLER]: "Seller",
  [USER_ROLES.CUSTOMER]: "Customer",
  [USER_ROLES.DELIVERY_STAFF]: "Delivery Staff",
  [USER_ROLES.SUPPORT_STAFF]: "Support Staff",
  [USER_ROLES.INVENTORY_MANAGER]: "Inventory Manager",
}

// Role Routes - Map backend roles to frontend routes
export const ROLE_ROUTES = {
  Admin: "/admin",
  Seller: "/seller",
  Customer: "/customer",
  DeliveryStaff: "/delivery",
  SupportStaff: "/support",
  InventoryManager: "/inventory",
}

// Actor Types for UI dropdown (backend determines actual role)
export const ACTOR_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "seller", label: "Seller" },
  { value: "admin", label: "Admin" },
  { value: "delivery", label: "Delivery Staff" },
  { value: "support", label: "Support Staff" },
  { value: "inventory", label: "Inventory Manager" },
]

// Dropdown Options for Forms
export const PHONE_PREFIXES = [
  { value: "+92", label: "+92 (Pakistan)" },
]

export const CITIES = [
  { value: "Karachi", label: "Karachi" },
  { value: "Lahore", label: "Lahore" },
  { value: "Islamabad", label: "Islamabad" },
]

export const VEHICLE_TYPES = [
  { value: "Bike", label: "Bike" },
  { value: "Car", label: "Car" },
  { value: "Van", label: "Van" },
  { value: "Truck", label: "Truck" },
]

export const WAREHOUSE_LOCATIONS = [
  { value: "Karachi Warehouse", label: "Karachi Warehouse" },
  { value: "Lahore Warehouse", label: "Lahore Warehouse" },
  { value: "Islamabad Warehouse", label: "Islamabad Warehouse" },
]

export const SUPPORT_SPECIALIZATIONS = [
  { value: "Technical Support", label: "Technical Support" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "Order Management", label: "Order Management" },
  { value: "Billing Support", label: "Billing Support" },
]

export const DEPARTMENTS = [
  { value: "Operations", label: "Operations" },
  { value: "Logistics", label: "Logistics" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Administration", label: "Administration" },
]

export const DELIVERY_AREAS = [
  { value: "Karachi North", label: "Karachi North" },
  { value: "Karachi South", label: "Karachi South" },
  { value: "Lahore Central", label: "Lahore Central" },
  { value: "Lahore Cantt", label: "Lahore Cantt" },
  { value: "Islamabad F-Sectors", label: "Islamabad F-Sectors" },
  { value: "Islamabad G-Sectors", label: "Islamabad G-Sectors" },
]