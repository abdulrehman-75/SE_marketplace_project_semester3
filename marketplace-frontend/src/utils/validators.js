import { z } from "zod"

// Password validation rules (matches backend)
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")

// ==================== PUBLIC AUTH SCHEMAS ====================

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  actorType: z.string().optional(), // For UI display only, not sent to API
})

// Forgot Password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
})

// Reset Password validation schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  verificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// ==================== CUSTOMER REGISTRATION ====================

export const registerCustomerSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(150, "Full name is too long"),
    
    // Optional fields
    phone: z.string().max(20, "Phone number is too long").optional(),
    shippingAddress: z.string().max(200, "Address is too long").optional(),
    city: z.string().max(100, "City name is too long").optional(),
    postalCode: z.string().max(20, "Postal code is too long").optional(),
    country: z.string().max(100, "Country name is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==================== SELLER REGISTRATION ====================

export const registerSellerSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    shopName: z.string().min(2, "Shop name must be at least 2 characters").max(150, "Shop name is too long"),
    
    // Optional business info
    shopDescription: z.string().max(500, "Description is too long").optional(),
    businessRegistrationNumber: z.string().max(100, "Registration number is too long").optional(),
    contactPhone: z.string().max(20, "Phone number is too long").optional(),
    address: z.string().max(200, "Address is too long").optional(),
    city: z.string().max(100, "City name is too long").optional(),
    country: z.string().max(100, "Country name is too long").optional(),
    
    // Optional banking info
    bankAccountName: z.string().max(150, "Account name is too long").optional(),
    bankAccountNumber: z.string().max(50, "Account number is too long").optional(),
    bankName: z.string().max(150, "Bank name is too long").optional(),
    bankBranchCode: z.string().max(50, "Branch code is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==================== ADMIN REGISTRATION (Admin Only) ====================

export const registerAdminSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(150, "Full name is too long"),
    
    // Optional fields
    employeeCode: z.string().max(50, "Employee code is too long").optional(),
    department: z.string().max(100, "Department name is too long").optional(),
    phone: z.string().max(20, "Phone number is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==================== DELIVERY STAFF REGISTRATION (Admin Only) ====================

export const registerDeliveryStaffSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(150, "Full name is too long"),
    
    // Optional staff fields
    employeeCode: z.string().max(50, "Employee code is too long").optional(),
    department: z.string().max(100, "Department name is too long").optional(),
    phone: z.string().max(20, "Phone number is too long").optional(),
    
    // Optional delivery-specific fields
    vehicleType: z.string().max(50, "Vehicle type is too long").optional(),
    vehicleNumber: z.string().max(50, "Vehicle number is too long").optional(),
    licenseNumber: z.string().max(100, "License number is too long").optional(),
    assignedArea: z.string().max(150, "Assigned area is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==================== SUPPORT STAFF REGISTRATION (Admin Only) ====================

export const registerSupportStaffSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(150, "Full name is too long"),
    
    // Optional staff fields
    employeeCode: z.string().max(50, "Employee code is too long").optional(),
    department: z.string().max(100, "Department name is too long").optional(),
    phone: z.string().max(20, "Phone number is too long").optional(),
    
    // Optional support-specific fields
    specialization: z.string().max(150, "Specialization is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==================== INVENTORY MANAGER REGISTRATION (Admin Only) ====================

export const registerInventoryManagerSchema = z
  .object({
    // Required fields
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(150, "Full name is too long"),
    
    // Optional staff fields
    employeeCode: z.string().max(50, "Employee code is too long").optional(),
    department: z.string().max(100, "Department name is too long").optional(),
    phone: z.string().max(20, "Phone number is too long").optional(),
    
    // Optional inventory-specific fields
    assignedWarehouse: z.string().max(100, "Warehouse location is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
