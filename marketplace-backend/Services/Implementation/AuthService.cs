using MarketPlace.Data;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Auth;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtService jwtService,
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _context = context;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Check password
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count == 0)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User has no assigned role"
                };
            }

            var role = roles.First();

            // Check if user is active
            var isActive = await CheckUserActiveStatusAsync(user.Id, role);
            if (!isActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Your account has been deactivated. Please contact support."
                };
            }

            // Generate JWT token
            var token = _jwtService.GenerateToken(user, role);
            var actorInfo = await GetActorInfoAsync(user.Id, role);

            // Update last login for Admin
            if (role == "Admin")
            {
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id);
                if (admin != null)
                {
                    admin.LastLoginDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                UserInfo = new UserInfoDto
                {
                    UserId = user.Id,
                    Email = user.Email!,
                    Role = role,
                    ActorInfo = actorInfo
                }
            };
        }

        public async Task<AuthResponseDto> RegisterSellerAsync(RegisterSellerDto request)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already registered"
                };
            }

            // Check if shop name already exists
            var existingShop = await _context.Sellers
                .AnyAsync(s => s.ShopName.ToLower() == request.ShopName.ToLower());
            if (existingShop)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Shop name already exists"
                };
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create AppUser
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                // Assign Seller role
                await EnsureRoleExistsAsync("Seller");
                await _userManager.AddToRoleAsync(user, "Seller");

                // Create Seller profile
                var seller = new Seller
                {
                    UserId = user.Id,
                    ShopName = request.ShopName,
                    ShopDescription = request.ShopDescription,
                    BusinessRegistrationNumber = request.BusinessRegistrationNumber,
                    ContactPhone = request.ContactPhone,
                    ContactEmail = request.Email,
                    Address = request.Address,
                    City = request.City,
                    Country = request.Country ?? "Pakistan",
                    BankAccountName = request.BankAccountName,
                    BankAccountNumber = request.BankAccountNumber,
                    BankName = request.BankName,
                    BankBranchCode = request.BankBranchCode,
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    IsVerified = false,
                    OverallRating = 0,
                    TotalReviews = 0,
                    TotalSales = 0,
                    TotalOrders = 0
                };

                _context.Sellers.Add(seller);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Generate token
                var token = _jwtService.GenerateToken(user, "Seller");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Seller registered successfully. Your account is pending verification.",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "Seller",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = seller.SellerId,
                            ActorType = "Seller",
                            DisplayName = seller.ShopName,
                            IsActive = seller.IsActive,
                            IsVerified = seller.IsVerified
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto request)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already registered"
                };
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create AppUser
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                // Assign Customer role
                await EnsureRoleExistsAsync("Customer");
                await _userManager.AddToRoleAsync(user, "Customer");

                // Create Customer profile
                var customer = new Customer
                {
                    UserId = user.Id,
                    FullName = request.FullName,
                    Phone = request.Phone,
                    ShippingAddress = request.ShippingAddress,
                    City = request.City,
                    PostalCode = request.PostalCode,
                    Country = request.Country ?? "Pakistan",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    TotalOrders = 0,
                    TotalSpent = 0
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Generate token
                var token = _jwtService.GenerateToken(user, "Customer");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Customer registered successfully",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "Customer",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = customer.CustomerId,
                            ActorType = "Customer",
                            DisplayName = customer.FullName,
                            IsActive = customer.IsActive
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> RegisterAdminAsync(RegisterAdminDto request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto { Success = false, Message = "Email already registered" };
            }

            if (!string.IsNullOrEmpty(request.EmployeeCode))
            {
                var existingCode = await _context.Admins
                    .AnyAsync(a => a.EmployeeCode == request.EmployeeCode);
                if (existingCode)
                {
                    return new AuthResponseDto { Success = false, Message = "Employee code already exists" };
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                await EnsureRoleExistsAsync("Admin");
                await _userManager.AddToRoleAsync(user, "Admin");

                var admin = new Admin
                {
                    UserId = user.Id,
                    EmployeeCode = request.EmployeeCode ?? $"ADM{DateTime.UtcNow.Ticks}",
                    Department = request.Department ?? "General",
                    DateJoined = DateTime.UtcNow,
                    LastLoginDate = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var token = _jwtService.GenerateToken(user, "Admin");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Admin registered successfully",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "Admin",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = admin.AdminId,
                            ActorType = "Admin",
                            DisplayName = admin.EmployeeCode,
                            IsActive = admin.IsActive
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto { Success = false, Message = $"Registration failed: {ex.Message}" };
            }
        }

        public async Task<AuthResponseDto> RegisterDeliveryStaffAsync(RegisterDeliveryStaffDto request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto { Success = false, Message = "Email already registered" };
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                await EnsureRoleExistsAsync("DeliveryStaff");
                await _userManager.AddToRoleAsync(user, "DeliveryStaff");

                var deliveryStaff = new DeliveryStaff
                {
                    UserId = user.Id,
                    FullName = request.FullName,
                    Phone = request.Phone,
                    VehicleType = request.VehicleType,
                    VehicleNumber = request.VehicleNumber,
                    LicenseNumber = request.LicenseNumber,
                    AssignedArea = request.AssignedArea,
                    DateJoined = DateTime.UtcNow,
                    IsActive = true,
                    IsAvailable = true
                };

                _context.DeliveryStaffs.Add(deliveryStaff);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var token = _jwtService.GenerateToken(user, "DeliveryStaff");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Delivery staff registered successfully",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "DeliveryStaff",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = deliveryStaff.DeliveryStaffId,
                            ActorType = "DeliveryStaff",
                            DisplayName = deliveryStaff.FullName,
                            IsActive = deliveryStaff.IsActive
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto { Success = false, Message = $"Registration failed: {ex.Message}" };
            }
        }

        public async Task<AuthResponseDto> RegisterSupportStaffAsync(RegisterSupportStaffDto request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto { Success = false, Message = "Email already registered" };
            }

            if (!string.IsNullOrEmpty(request.EmployeeCode))
            {
                var existingCode = await _context.SupportStaffs
                    .AnyAsync(s => s.EmployeeCode == request.EmployeeCode);
                if (existingCode)
                {
                    return new AuthResponseDto { Success = false, Message = "Employee code already exists" };
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                await EnsureRoleExistsAsync("SupportStaff");
                await _userManager.AddToRoleAsync(user, "SupportStaff");

                var supportStaff = new SupportStaff
                {
                    UserId = user.Id,
                    FullName = request.FullName,
                    EmployeeCode = request.EmployeeCode ?? $"SUP{DateTime.UtcNow.Ticks}",
                    Department = request.Department ?? "Customer Support",
                    Phone = request.Phone,
                    Email = request.Email,
                    Specialization = request.Specialization,
                    DateJoined = DateTime.UtcNow,
                    IsActive = true
                };

                _context.SupportStaffs.Add(supportStaff);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var token = _jwtService.GenerateToken(user, "SupportStaff");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Support staff registered successfully",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "SupportStaff",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = supportStaff.SupportStaffId,
                            ActorType = "SupportStaff",
                            DisplayName = supportStaff.FullName,
                            IsActive = supportStaff.IsActive
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto { Success = false, Message = $"Registration failed: {ex.Message}" };
            }
        }

        public async Task<AuthResponseDto> RegisterInventoryManagerAsync(RegisterInventoryManagerDto request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto { Success = false, Message = "Email already registered" };
            }

            if (!string.IsNullOrEmpty(request.EmployeeCode))
            {
                var existingCode = await _context.InventoryManagers
                    .AnyAsync(i => i.EmployeeCode == request.EmployeeCode);
                if (existingCode)
                {
                    return new AuthResponseDto { Success = false, Message = "Employee code already exists" };
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new AppUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                await EnsureRoleExistsAsync("InventoryManager");
                await _userManager.AddToRoleAsync(user, "InventoryManager");

                var inventoryManager = new InventoryManager
                {
                    UserId = user.Id,
                    FullName = request.FullName,
                    EmployeeCode = request.EmployeeCode ?? $"INV{DateTime.UtcNow.Ticks}",
                    Department = request.Department ?? "Inventory",
                    Phone = request.Phone,
                    Email = request.Email,
                    AssignedWarehouse = request.AssignedWarehouse,
                    DateJoined = DateTime.UtcNow,
                    IsActive = true
                };

                _context.InventoryManagers.Add(inventoryManager);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var token = _jwtService.GenerateToken(user, "InventoryManager");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Inventory manager registered successfully",
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(120),
                    UserInfo = new UserInfoDto
                    {
                        UserId = user.Id,
                        Email = user.Email!,
                        Role = "InventoryManager",
                        ActorInfo = new ActorInfoDto
                        {
                            ActorId = inventoryManager.InventoryManagerId,
                            ActorType = "InventoryManager",
                            DisplayName = inventoryManager.FullName,
                            IsActive = inventoryManager.IsActive
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new AuthResponseDto { Success = false, Message = $"Registration failed: {ex.Message}" };
            }
        }

        // ================== PASSWORD RESET METHODS ==================

        public async Task<PasswordResetResponseDto> ForgotPasswordAsync(ForgotPasswordDto request)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Don't reveal that user doesn't exist for security
                return new PasswordResetResponseDto
                {
                    Success = true,
                    Message = "If your email exists in our system, you will receive a password reset code shortly."
                };
            }

            // Check if user is active
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count > 0)
            {
                var role = roles.First();
                var isActive = await CheckUserActiveStatusAsync(user.Id, role);
                if (!isActive)
                {
                    return new PasswordResetResponseDto
                    {
                        Success = false,
                        Message = "Your account is deactivated. Please contact support."
                    };
                }
            }

            // Delete any existing unused tokens for this user
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed)
                .ToListAsync();

            if (existingTokens.Any())
            {
                _context.PasswordResetTokens.RemoveRange(existingTokens);
            }

            // Generate 6-digit code
            var random = new Random();
            var verificationCode = random.Next(100000, 999999).ToString();

            // Create reset token
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Code = verificationCode,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 minutes expiry
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // Get user's display name
            var displayName = await GetUserDisplayNameAsync(user.Id);

            // Send email
            var emailSent = await _emailService.SendPasswordResetEmailAsync(
                user.Email!,
                displayName ?? user.Email!,
                verificationCode
            );

            if (!emailSent)
            {
                return new PasswordResetResponseDto
                {
                    Success = false,
                    Message = "Failed to send verification email. Please try again later."
                };
            }

            return new PasswordResetResponseDto
            {
                Success = true,
                Message = "Verification code sent to your email. Please check your inbox."
            };
        }

        public async Task<PasswordResetResponseDto> ResetPasswordAsync(ResetPasswordDto request)
        {
            // Find user
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new PasswordResetResponseDto
                {
                    Success = false,
                    Message = "Invalid email or verification code."
                };
            }

            // Find valid token
            var resetToken = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id
                         && t.Code == request.VerificationCode
                         && !t.IsUsed
                         && t.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (resetToken == null)
            {
                return new PasswordResetResponseDto
                {
                    Success = false,
                    Message = "Invalid or expired verification code."
                };
            }

            // Reset password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

            if (!result.Succeeded)
            {
                return new PasswordResetResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            // Mark token as used
            resetToken.IsUsed = true;
            resetToken.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new PasswordResetResponseDto
            {
                Success = true,
                Message = "Password reset successfully. You can now login with your new password."
            };
        }

        // Helper method to get user display name
        private async Task<string?> GetUserDisplayNameAsync(string userId)
        {
            var customer = await _context.Customers
                .Where(c => c.UserId == userId)
                .Select(c => c.FullName)
                .FirstOrDefaultAsync();

            if (customer != null) return customer;

            var seller = await _context.Sellers
                .Where(s => s.UserId == userId)
                .Select(s => s.ShopName)
                .FirstOrDefaultAsync();

            if (seller != null) return seller;

            var admin = await _context.Admins
                .Where(a => a.UserId == userId)
                .Select(a => a.EmployeeCode)
                .FirstOrDefaultAsync();

            if (admin != null) return admin;

            var delivery = await _context.DeliveryStaffs
                .Where(d => d.UserId == userId)
                .Select(d => d.FullName)
                .FirstOrDefaultAsync();

            if (delivery != null) return delivery;

            var support = await _context.SupportStaffs
                .Where(s => s.UserId == userId)
                .Select(s => s.FullName)
                .FirstOrDefaultAsync();

            if (support != null) return support;

            var inventory = await _context.InventoryManagers
                .Where(i => i.UserId == userId)
                .Select(i => i.FullName)
                .FirstOrDefaultAsync();

            return inventory;
        }

        // ================== HELPER METHODS (NOW ASYNC) ==================

        private async Task<bool> CheckUserActiveStatusAsync(string userId, string role)
        {
            return role switch
            {
                "Admin" => await _context.Admins.AnyAsync(a => a.UserId == userId && a.IsActive),
                "Seller" => await _context.Sellers.AnyAsync(s => s.UserId == userId && s.IsActive),
                "Customer" => await _context.Customers.AnyAsync(c => c.UserId == userId && c.IsActive),
                "DeliveryStaff" => await _context.DeliveryStaffs.AnyAsync(d => d.UserId == userId && d.IsActive),
                "SupportStaff" => await _context.SupportStaffs.AnyAsync(s => s.UserId == userId && s.IsActive),
                "InventoryManager" => await _context.InventoryManagers.AnyAsync(i => i.UserId == userId && i.IsActive),
                _ => false
            };
        }

        private async Task<ActorInfoDto?> GetActorInfoAsync(string userId, string role)
        {
            return role switch
            {
                "Admin" => await GetAdminInfoAsync(userId),
                "Seller" => await GetSellerInfoAsync(userId),
                "Customer" => await GetCustomerInfoAsync(userId),
                "DeliveryStaff" => await GetDeliveryStaffInfoAsync(userId),
                "SupportStaff" => await GetSupportStaffInfoAsync(userId),
                "InventoryManager" => await GetInventoryManagerInfoAsync(userId),
                _ => null
            };
        }

        private async Task<ActorInfoDto?> GetAdminInfoAsync(string userId)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
            return admin == null ? null : new ActorInfoDto
            {
                ActorId = admin.AdminId,
                ActorType = "Admin",
                DisplayName = admin.EmployeeCode,
                IsActive = admin.IsActive
            };
        }

        private async Task<ActorInfoDto?> GetSellerInfoAsync(string userId)
        {
            var seller = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == userId);
            return seller == null ? null : new ActorInfoDto
            {
                ActorId = seller.SellerId,
                ActorType = "Seller",
                DisplayName = seller.ShopName,
                IsActive = seller.IsActive,
                IsVerified = seller.IsVerified,
                OverallRating = seller.OverallRating
            };
        }

        private async Task<ActorInfoDto?> GetCustomerInfoAsync(string userId)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            return customer == null ? null : new ActorInfoDto
            {
                ActorId = customer.CustomerId,
                ActorType = "Customer",
                DisplayName = customer.FullName,
                IsActive = customer.IsActive
            };
        }

        private async Task<ActorInfoDto?> GetDeliveryStaffInfoAsync(string userId)
        {
            var staff = await _context.DeliveryStaffs.FirstOrDefaultAsync(d => d.UserId == userId);
            return staff == null ? null : new ActorInfoDto
            {
                ActorId = staff.DeliveryStaffId,
                ActorType = "DeliveryStaff",
                DisplayName = staff.FullName,
                IsActive = staff.IsActive
            };
        }

        private async Task<ActorInfoDto?> GetSupportStaffInfoAsync(string userId)
        {
            var staff = await _context.SupportStaffs.FirstOrDefaultAsync(s => s.UserId == userId);
            return staff == null ? null : new ActorInfoDto
            {
                ActorId = staff.SupportStaffId,
                ActorType = "SupportStaff",
                DisplayName = staff.FullName,
                IsActive = staff.IsActive
            };
        }

        private async Task<ActorInfoDto?> GetInventoryManagerInfoAsync(string userId)
        {
            var manager = await _context.InventoryManagers.FirstOrDefaultAsync(i => i.UserId == userId);
            return manager == null ? null : new ActorInfoDto
            {
                ActorId = manager.InventoryManagerId,
                ActorType = "InventoryManager",
                DisplayName = manager.FullName,
                IsActive = manager.IsActive
            };
        }

        private async Task EnsureRoleExistsAsync(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }
}