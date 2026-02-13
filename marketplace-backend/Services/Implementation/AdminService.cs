using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Admin.MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Auth;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;


namespace MarketPlace.Services.Implementation
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly UserManager<AppUser> _userManager;

        public AdminService(
            ApplicationDbContext context,
            IAuthService authService,
            ICloudinaryService cloudinaryService,
            UserManager<AppUser> userManager)
        {
            _context = context;
            _authService = authService;
            _cloudinaryService = cloudinaryService;
            _userManager = userManager;
        }

        // ============================================
        // PROFILE MANAGEMENT
        // ============================================

        public async Task<ApiResponse<AdminProfileDto>> GetMyProfileAsync(int adminId)
        {
            var admin = await _context.Admins
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AdminId == adminId);

            if (admin == null)
                return ApiResponse<AdminProfileDto>.ErrorResponse("Admin not found");

            var profile = new AdminProfileDto
            {
                AdminId = admin.AdminId,
                UserId = admin.UserId,
                UserName = admin.User.UserName!,
                Email = admin.User.Email!,
                EmployeeCode = admin.EmployeeCode,
                Department = admin.Department,
                DateJoined = admin.DateJoined,
                LastLoginDate = admin.LastLoginDate,
                IsActive = admin.IsActive
            };

            return ApiResponse<AdminProfileDto>.SuccessResponse(profile);
        }

        // ============================================
        // SELLER MANAGEMENT
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminSellerListDto>>> GetAllSellersAsync(SellerFilterParams filterParams)
        {
            var query = _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Products)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filterParams.SearchTerm))
            {
                var search = $"%{filterParams.SearchTerm.Trim()}%";
                query = query.Where(s =>
                    EF.Functions.Like(s.ShopName!, search) ||
                    EF.Functions.Like(s.User.Email!, search) ||
                    (s.ContactPhone != null && EF.Functions.Like(s.ContactPhone, search))
                );
            }


            if (filterParams.IsVerified.HasValue)
                query = query.Where(s => s.IsVerified == filterParams.IsVerified.Value);

            if (filterParams.IsActive.HasValue)
                query = query.Where(s => s.IsActive == filterParams.IsActive.Value);

            if (filterParams.MinRating.HasValue)
                query = query.Where(s => s.OverallRating >= filterParams.MinRating.Value);

            if (!string.IsNullOrEmpty(filterParams.City))
                query = query.Where(s => s.City != null && s.City.ToLower() == filterParams.City.ToLower());

            if (filterParams.RegisteredAfter.HasValue)
                query = query.Where(s => s.DateRegistered >= filterParams.RegisteredAfter.Value);

            if (filterParams.RegisteredBefore.HasValue)
                query = query.Where(s => s.DateRegistered <= filterParams.RegisteredBefore.Value);

            // Apply sorting
            query = query.ApplySorting(filterParams.SortBy ?? "DateRegistered", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = pagedResult.Items.Select(s => new AdminSellerListDto
            {
                SellerId = s.SellerId,
                UserId = s.UserId,
                Email = s.User.Email!,
                ShopName = s.ShopName,
                ShopLogo = s.ShopLogo,
                ContactPhone = s.ContactPhone,
                City = s.City,
                DateRegistered = s.DateRegistered,
                IsVerified = s.IsVerified,
                IsActive = s.IsActive,
                OverallRating = s.OverallRating,
                TotalReviews = s.TotalReviews,
                TotalSales = s.TotalSales,
                TotalOrders = s.TotalOrders,
                TotalProducts = s.Products.Count
            }).ToList();

            return ApiResponse<PagedResult<AdminSellerListDto>>.SuccessResponse(new PagedResult<AdminSellerListDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<AdminSellerDetailDto>> GetSellerDetailsAsync(int sellerId)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Products)
                .Include(s => s.Followers)
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (seller == null)
                return ApiResponse<AdminSellerDetailDto>.ErrorResponse("Seller not found");

            var pendingPayments = await _context.PaymentVerifications
                .Where(pv => pv.SellerId == sellerId &&
                    (pv.Status == nameof(PaymentStatus.Pending) || pv.Status == nameof(PaymentStatus.VerificationPeriod)))
                .SumAsync(pv => pv.Amount);

            var details = new AdminSellerDetailDto
            {
                SellerId = seller.SellerId,
                UserId = seller.UserId,
                Email = seller.User.Email!,
                ShopName = seller.ShopName,
                ShopLogo = seller.ShopLogo,
                ShopDescription = seller.ShopDescription,
                BusinessRegistrationNumber = seller.BusinessRegistrationNumber,
                ContactPhone = seller.ContactPhone,
                ContactEmail = seller.ContactEmail,
                Address = seller.Address,
                City = seller.City,
                Country = seller.Country,
                DateRegistered = seller.DateRegistered,
                IsVerified = seller.IsVerified,
                IsActive = seller.IsActive,
                OverallRating = seller.OverallRating,
                TotalReviews = seller.TotalReviews,
                TotalSales = seller.TotalSales,
                TotalOrders = seller.TotalOrders,
                TotalProducts = seller.Products.Count,
                BankAccountName = seller.BankAccountName,
                BankAccountNumber = seller.BankAccountNumber,
                BankName = seller.BankName,
                TotalFollowers = seller.Followers.Count,
                ActiveProducts = seller.Products.Count(p => p.IsActive),
                LowStockProducts = seller.Products.Count(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive),
                PendingPayments = pendingPayments
            };

            return ApiResponse<AdminSellerDetailDto>.SuccessResponse(details);
        }

        public async Task<ApiResponse<int>> CreateSellerAsync(CreateSellerByAdminDto dto)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return ApiResponse<int>.ErrorResponse("Email already registered");
            }

            // Check if shop name already exists
            var existingShop = await _context.Sellers
                .AnyAsync(s => s.ShopName.ToLower() == dto.ShopName.ToLower());
            if (existingShop)
            {
                return ApiResponse<int>.ErrorResponse("Shop name already exists");
            }

            // Map CreateSellerByAdminDto to RegisterSellerDto
            var registerDto = new RegisterSellerDto
            {
                Email = dto.Email,
                Password = dto.Password,
                ConfirmPassword = dto.Password, // Admin sets password, so no need for separate confirmation
                ShopName = dto.ShopName,
                ContactPhone = dto.ContactPhone,
                City = dto.City,
                // Optional fields - leave null if not provided
                ShopDescription = null,
                BusinessRegistrationNumber = null,
                Address = null,
                Country = "Pakistan", // Default value
                BankAccountName = null,
                BankAccountNumber = null,
                BankName = null,
                BankBranchCode = null
            };

            // Call auth service to register the seller
            var authResponse = await _authService.RegisterSellerAsync(registerDto);

            if (!authResponse.Success)
                return ApiResponse<int>.ErrorResponse(authResponse.Message);

            // Update seller verification status if admin wants to verify immediately
            if (dto.IsVerified)
            {
                var seller = await _context.Sellers
                    .FirstOrDefaultAsync(s => s.UserId == authResponse.UserInfo!.UserId);

                if (seller != null)
                {
                    seller.IsVerified = true;

                    // Update ContactEmail if provided
                    if (!string.IsNullOrEmpty(dto.ContactEmail))
                    {
                        seller.ContactEmail = dto.ContactEmail;
                    }

                    await _context.SaveChangesAsync();

                    // Send notification to seller
                    var notification = new Notification
                    {
                        UserId = seller.UserId,
                        NotificationType = nameof(NotificationType.SystemAlert),
                        Message = "Your seller account has been verified!",
                        DetailedMessage = "Your account was verified during registration by an administrator. You can now start selling products on our platform.",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();
                }
            }

            return ApiResponse<int>.SuccessResponse(
                authResponse.UserInfo!.ActorInfo!.ActorId,
                dto.IsVerified ? "Seller created and verified successfully" : "Seller created successfully. Account pending verification.");
        }


        public async Task<ApiResponse<bool>> UpdateSellerStatusAsync(UpdateSellerStatusDto dto)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.SellerId == dto.SellerId);

            if (seller == null)
                return ApiResponse<bool>.ErrorResponse("Seller not found");

            bool statusChanged = false;
            var notifications = new List<Notification>();

            if (dto.IsVerified.HasValue && seller.IsVerified != dto.IsVerified.Value)
            {
                seller.IsVerified = dto.IsVerified.Value;
                statusChanged = true;

                notifications.Add(new Notification
                {
                    UserId = seller.UserId,
                    NotificationType = nameof(NotificationType.SystemAlert),
                    Message = dto.IsVerified.Value
                        ? "Your seller account has been verified!"
                        : "Your seller verification has been revoked",
                    DetailedMessage = dto.IsVerified.Value
                        ? "You can now start selling products on our platform."
                        : "Please contact support for more information.",
                    DateCreated = DateTime.UtcNow,
                    IsRead = false
                });
            }

            if (dto.IsActive.HasValue && seller.IsActive != dto.IsActive.Value)
            {
                seller.IsActive = dto.IsActive.Value;
                statusChanged = true;

                notifications.Add(new Notification
                {
                    UserId = seller.UserId,
                    NotificationType = nameof(NotificationType.SystemAlert),
                    Message = dto.IsActive.Value
                        ? "Your seller account has been activated"
                        : "Your seller account has been deactivated",
                    DetailedMessage = dto.IsActive.Value
                        ? "You can now access your seller dashboard."
                        : "Please contact support for more information.",
                    DateCreated = DateTime.UtcNow,
                    IsRead = false
                });
            }

            if (statusChanged)
            {
                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();
                return ApiResponse<bool>.SuccessResponse(true, "Seller status updated successfully");
            }

            return ApiResponse<bool>.ErrorResponse("No changes were made");
        }

        public async Task<ApiResponse<bool>> DeleteSellerAsync(int sellerId)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (seller == null)
                return ApiResponse<bool>.ErrorResponse("Seller not found");

            // Check for pending orders
            var hasPendingOrders = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.SellerId == sellerId &&
                    (oi.Order.OrderStatus == nameof(OrderStatus.Pending) ||
                     oi.Order.OrderStatus == nameof(OrderStatus.Confirmed) ||
                     oi.Order.OrderStatus == nameof(OrderStatus.PickedUp) ||
                     oi.Order.OrderStatus == nameof(OrderStatus.OnTheWay)));

            if (hasPendingOrders)
                return ApiResponse<bool>.ErrorResponse("Cannot delete seller with pending orders. Please deactivate instead.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Delete all products and their images
                foreach (var product in seller.Products)
                {
                    if (!string.IsNullOrEmpty(product.ProductImage))
                    {
                        var publicId = _cloudinaryService.GetPublicIdFromUrl(product.ProductImage);
                        if (!string.IsNullOrEmpty(publicId))
                            await _cloudinaryService.DeleteImageAsync(publicId);
                    }
                }

                // Delete shop logo
                if (!string.IsNullOrEmpty(seller.ShopLogo))
                {
                    var publicId = _cloudinaryService.GetPublicIdFromUrl(seller.ShopLogo);
                    if (!string.IsNullOrEmpty(publicId))
                        await _cloudinaryService.DeleteImageAsync(publicId);
                }

                // Delete user account
                var user = seller.User;
                _context.Sellers.Remove(seller);
                await _context.SaveChangesAsync();

                await _userManager.DeleteAsync(user);
                await transaction.CommitAsync();

                return ApiResponse<bool>.SuccessResponse(true, "Seller deleted successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<bool>.ErrorResponse($"Failed to delete seller: {ex.Message}");
            }
        }

        // ============================================
        // CUSTOMER MANAGEMENT
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminCustomerListDto>>> GetAllCustomersAsync(CustomerFilterParams filterParams)
        {
            var query = _context.Customers
                .Include(c => c.User)
                .Include(c => c.Orders)
                .Include(c => c.Reviews)
                .Include(c => c.Complaints)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filterParams.SearchTerm))
            {
                var search = $"%{filterParams.SearchTerm.Trim()}%";

                query = query.Where(c =>
                    EF.Functions.Like(c.FullName!, search) ||
                    EF.Functions.Like(c.User.Email!, search) ||
                    (c.Phone != null && EF.Functions.Like(c.Phone, search))
                );
            }

            if (filterParams.IsActive.HasValue)
                query = query.Where(c => c.IsActive == filterParams.IsActive.Value);

            if (!string.IsNullOrEmpty(filterParams.City))
                query = query.Where(c => c.City != null && c.City.ToLower() == filterParams.City.ToLower());

            if (filterParams.MinSpent.HasValue)
                query = query.Where(c => c.TotalSpent >= filterParams.MinSpent.Value);

            if (filterParams.MinOrders.HasValue)
                query = query.Where(c => c.TotalOrders >= filterParams.MinOrders.Value);

            // Apply sorting
            query = query.ApplySorting(filterParams.SortBy ?? "DateRegistered", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = pagedResult.Items.Select(c => new AdminCustomerListDto
            {
                CustomerId = c.CustomerId,
                UserId = c.UserId,
                FullName = c.FullName,
                Email = c.User.Email!,
                Phone = c.Phone,
                City = c.City,
                DateRegistered = c.DateRegistered,
                IsActive = c.IsActive,
                TotalOrders = c.TotalOrders,
                TotalSpent = c.TotalSpent,
                TotalReviews = c.Reviews.Count,
                TotalComplaints = c.Complaints.Count
            }).ToList();

            return ApiResponse<PagedResult<AdminCustomerListDto>>.SuccessResponse(new PagedResult<AdminCustomerListDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<AdminCustomerDetailDto>> GetCustomerDetailsAsync(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .Include(c => c.Orders)
                .Include(c => c.Reviews)
                .Include(c => c.Complaints)
                .Include(c => c.FollowedSellers)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (customer == null)
                return ApiResponse<AdminCustomerDetailDto>.ErrorResponse("Customer not found");

            var recentOrders = customer.Orders
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new CustomerOrderSummaryDto
                {
                    OrderId = o.OrderId,
                    OrderDate = o.OrderDate,
                    GrandTotal = o.GrandTotal,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.PaymentStatus
                }).ToList();

            var details = new AdminCustomerDetailDto
            {
                CustomerId = customer.CustomerId,
                UserId = customer.UserId,
                FullName = customer.FullName,
                Email = customer.User.Email!,
                Phone = customer.Phone,
                ShippingAddress = customer.ShippingAddress,
                City = customer.City,
                PostalCode = customer.PostalCode,
                Country = customer.Country,
                DateRegistered = customer.DateRegistered,
                IsActive = customer.IsActive,
                TotalOrders = customer.TotalOrders,
                TotalSpent = customer.TotalSpent,
                TotalReviews = customer.Reviews.Count,
                TotalComplaints = customer.Complaints.Count,
                FollowedSellersCount = customer.FollowedSellers.Count,
                RecentOrders = recentOrders
            };

            return ApiResponse<AdminCustomerDetailDto>.SuccessResponse(details);
        }

        // ============================================
        // ORDER MANAGEMENT
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminOrderListDto>>> GetAllOrdersAsync(OrderFilterParams filterParams)
        {
            var query = _context.Orders
                .Include(o => o.Customer).ThenInclude(c => c.User)
                .Include(o => o.DeliveryStaff).ThenInclude(ds => ds!.User)
                .Include(o => o.OrderItems)
                .AsQueryable();

            // Apply filters
            if (filterParams.CustomerId.HasValue)
                query = query.Where(o => o.CustomerId == filterParams.CustomerId.Value);

            if (!string.IsNullOrEmpty(filterParams.OrderStatus))
                query = query.Where(o => o.OrderStatus == filterParams.OrderStatus);

            if (!string.IsNullOrEmpty(filterParams.PaymentStatus))
                query = query.Where(o => o.PaymentStatus == filterParams.PaymentStatus);

            if (filterParams.FromDate.HasValue)
                query = query.Where(o => o.OrderDate >= filterParams.FromDate.Value);

            if (filterParams.ToDate.HasValue)
                query = query.Where(o => o.OrderDate <= filterParams.ToDate.Value);

            // Apply sorting
            query = query.ApplySorting(filterParams.SortBy ?? "OrderDate", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = pagedResult.Items.Select(o => new AdminOrderListDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer.FullName,
                CustomerEmail = o.Customer.User.Email,
                GrandTotal = o.GrandTotal,
                OrderStatus = o.OrderStatus,
                PaymentStatus = o.PaymentStatus,
                PaymentMethod = o.PaymentMethod,
                TotalItems = o.OrderItems.Sum(oi => oi.Quantity),
                DeliveryDate = o.DeliveryDate,
                CustomerReportedProblem = o.CustomerReportedProblem,
                DeliveryStaffId = o.DeliveryStaffId,
                DeliveryStaffName = o.DeliveryStaff != null ? o.DeliveryStaff.FullName : null
            }).ToList();

            return ApiResponse<PagedResult<AdminOrderListDto>>.SuccessResponse(new PagedResult<AdminOrderListDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<AdminOrderDetailDto>> GetOrderDetailsAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer).ThenInclude(c => c.User)
                .Include(o => o.DeliveryStaff).ThenInclude(ds => ds!.User)
                .Include(o => o.AssignedSupportStaff)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ThenInclude(p => p.Seller)
                .Include(o => o.PaymentVerifications).ThenInclude(pv => pv.Seller)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return ApiResponse<AdminOrderDetailDto>.ErrorResponse("Order not found");

            var details = new AdminOrderDetailDto
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.FullName,
                CustomerEmail = order.Customer.User.Email,
                TotalAmount = order.TotalAmount,
                BuyerProtectionFee = order.BuyerProtectionFee,
                GrandTotal = order.GrandTotal,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.PaymentStatus,
                PaymentMethod = order.PaymentMethod,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryCity = order.DeliveryCity,
                DeliveryPostalCode = order.DeliveryPostalCode,
                CustomerPhone = order.CustomerPhone,
                DeliveryDate = order.DeliveryDate,
                VerificationPeriodStart = order.VerificationPeriodStart,
                VerificationPeriodEnd = order.VerificationPeriodEnd,
                CustomerConfirmedReceipt = order.CustomerConfirmedReceipt,
                CustomerReportedProblem = order.CustomerReportedProblem,
                ProblemDescription = order.ProblemDescription,
                DeliveryStaffId = order.DeliveryStaffId,
                DeliveryStaffName = order.DeliveryStaff?.FullName,
                AssignedSupportStaffId = order.AssignedSupportStaffId,
                AssignedSupportStaffName = order.AssignedSupportStaff?.FullName,
                AdminNotes = order.AdminNotes,
                TotalItems = order.OrderItems.Sum(oi => oi.Quantity),
                OrderItems = order.OrderItems.Select(oi => new AdminOrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductImage = oi.ProductImage,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    Subtotal = oi.Subtotal,
                    SellerId = oi.SellerId,
                    SellerShopName = oi.Product?.Seller?.ShopName ?? "N/A"
                }).ToList(),
                PaymentVerifications = order.PaymentVerifications.Select(pv => MapToPaymentVerificationSummary(pv)).ToList()
            };

            return ApiResponse<AdminOrderDetailDto>.SuccessResponse(details);
        }

        /// <summary>
        /// Admin force-confirm order (override multi-vendor confirmation system)
        /// </summary>
        public async Task<ApiResponse<bool>> AdminConfirmOrderAsync(int adminId, int orderId, AdminConfirmOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Include(o => o.Customer).ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                    return ApiResponse<bool>.ErrorResponse("Order not found");

                // Check if order is in pending status
                if (order.OrderStatus != nameof(OrderStatus.Pending))
                    return ApiResponse<bool>.ErrorResponse($"Order cannot be confirmed. Current status: {order.OrderStatus}");

                var admin = await _context.Admins
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.AdminId == adminId);

                if (admin == null)
                    return ApiResponse<bool>.ErrorResponse("Admin not found");

                // Get all unique sellers in this order
                var allSellers = order.OrderItems.Select(oi => oi.SellerId).Distinct().ToList();

                // Get already confirmed sellers
                var existingConfirmations = await _context.Set<SellerOrderConfirmation>()
                    .Where(sc => sc.OrderId == orderId)
                    .Select(sc => sc.SellerId)
                    .ToListAsync();

                var notifications = new List<Notification>();
                var confirmationsToAdd = new List<SellerOrderConfirmation>();

                // Determine which sellers to confirm
                List<int> sellersToConfirm;
                if (dto.SpecificSellerId.HasValue)
                {
                    // Confirm specific seller only
                    if (!allSellers.Contains(dto.SpecificSellerId.Value))
                        return ApiResponse<bool>.ErrorResponse("Specified seller has no items in this order");

                    if (existingConfirmations.Contains(dto.SpecificSellerId.Value))
                        return ApiResponse<bool>.ErrorResponse("This seller has already confirmed the order");

                    sellersToConfirm = new List<int> { dto.SpecificSellerId.Value };
                }
                else
                {
                    // Confirm all unconfirmed sellers
                    sellersToConfirm = allSellers.Except(existingConfirmations).ToList();

                    if (!sellersToConfirm.Any())
                        return ApiResponse<bool>.ErrorResponse("All sellers have already confirmed this order");
                }

                // Create confirmation records for sellers
                foreach (var sellerId in sellersToConfirm)
                {
                    confirmationsToAdd.Add(new SellerOrderConfirmation
                    {
                        OrderId = orderId,
                        SellerId = sellerId,
                        ConfirmedAt = DateTime.UtcNow
                    });

                    // Notify seller if requested
                    if (dto.NotifySellers)
                    {
                        var seller = await _context.Sellers.Include(s => s.User).FirstOrDefaultAsync(s => s.SellerId == sellerId);
                        if (seller != null)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = seller.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Order #{orderId} has been confirmed by admin on your behalf",
                                DetailedMessage = $"Reason: {dto.Reason}\nConfirmed by: {admin.User.Email}",
                                RelatedEntityId = orderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow,
                                IsRead = false
                            });
                        }
                    }
                }

                _context.Set<SellerOrderConfirmation>().AddRange(confirmationsToAdd);

                // Check if all sellers are now confirmed (existing + newly added)
                var allConfirmedSellers = existingConfirmations.Concat(sellersToConfirm).ToList();
                bool allSellersConfirmed = allSellers.All(s => allConfirmedSellers.Contains(s));

                // Update order status if all sellers confirmed
                if (allSellersConfirmed)
                {
                    order.OrderStatus = nameof(OrderStatus.Confirmed);

                    // Add admin note
                    order.AdminNotes = string.IsNullOrEmpty(order.AdminNotes)
                        ? $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Order force-confirmed by admin {admin.User.Email}. Reason: {dto.Reason}"
                        : $"{order.AdminNotes}\n[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Order force-confirmed by admin {admin.User.Email}. Reason: {dto.Reason}";

                    // Notify customer if requested
                    if (dto.NotifyCustomer)
                    {
                        notifications.Add(new Notification
                        {
                            UserId = order.Customer.UserId,
                            NotificationType = nameof(NotificationType.OrderConfirmed),
                            Message = $"Order #{orderId} has been confirmed by all sellers",
                            DetailedMessage = "Your order is now being processed for delivery.",
                            RelatedEntityId = orderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        });
                    }
                }
                else
                {
                    // Partial confirmation by admin
                    var remainingSellers = allSellers.Except(allConfirmedSellers).Count();

                    order.AdminNotes = string.IsNullOrEmpty(order.AdminNotes)
                        ? $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Partial confirmation by admin {admin.User.Email}. {sellersToConfirm.Count} seller(s) confirmed. {remainingSellers} remaining. Reason: {dto.Reason}"
                        : $"{order.AdminNotes}\n[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Partial confirmation by admin {admin.User.Email}. {sellersToConfirm.Count} seller(s) confirmed. {remainingSellers} remaining. Reason: {dto.Reason}";

                    // Notify customer about partial confirmation if requested
                    if (dto.NotifyCustomer)
                    {
                        notifications.Add(new Notification
                        {
                            UserId = order.Customer.UserId,
                            NotificationType = nameof(NotificationType.OrderConfirmed),
                            Message = $"Order #{orderId} - {sellersToConfirm.Count} seller(s) confirmed by admin",
                            DetailedMessage = $"Waiting for {remainingSellers} more seller(s) to confirm.\nReason for admin intervention: {dto.Reason}",
                            RelatedEntityId = orderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        });
                    }
                }

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var message = allSellersConfirmed
                    ? $"Order fully confirmed. All {allSellers.Count} seller(s) have been confirmed by admin."
                    : dto.SpecificSellerId.HasValue
                        ? $"Seller confirmed successfully. {allSellers.Count - allConfirmedSellers.Count} seller(s) remaining."
                        : $"{sellersToConfirm.Count} seller(s) confirmed. {allSellers.Count - allConfirmedSellers.Count} seller(s) remaining.";

                return ApiResponse<bool>.SuccessResponse(true, message);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<bool>.ErrorResponse($"Failed to confirm order: {ex.Message}");
            }
        }


        // ============================================
        // PAYMENT VERIFICATION MANAGEMENT
        // ============================================

        public async Task<ApiResponse<PagedResult<PaymentVerificationSummaryDto>>> GetAllPaymentVerificationsAsync(PaymentVerificationFilterParams filterParams)
        {
            var query = _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer)
                .Include(pv => pv.Seller)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filterParams.Status))
                query = query.Where(pv => pv.Status == filterParams.Status);

            if (filterParams.SellerId.HasValue)
                query = query.Where(pv => pv.SellerId == filterParams.SellerId.Value);

            if (filterParams.IsDisputed.HasValue && filterParams.IsDisputed.Value)
                query = query.Where(pv => pv.Order.CustomerReportedProblem);

            if (filterParams.IsExpired.HasValue && filterParams.IsExpired.Value)
                query = query.Where(pv => pv.VerificationEndDate < DateTime.UtcNow);

            if (filterParams.FromDate.HasValue)
                query = query.Where(pv => pv.VerificationStartDate >= filterParams.FromDate.Value);

            if (filterParams.ToDate.HasValue)
                query = query.Where(pv => pv.VerificationEndDate <= filterParams.ToDate.Value);

            // Apply sorting
            query = query.ApplySorting(filterParams.SortBy ?? "VerificationStartDate", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = pagedResult.Items.Select(MapToPaymentVerificationSummary).ToList();

            return ApiResponse<PagedResult<PaymentVerificationSummaryDto>>.SuccessResponse(new PagedResult<PaymentVerificationSummaryDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<PaymentVerificationDetailDto>> GetPaymentVerificationDetailsAsync(int verificationId)
        {
            var verification = await _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer).ThenInclude(c => c.User)
                .Include(pv => pv.Seller).ThenInclude(s => s.User)
                .FirstOrDefaultAsync(pv => pv.VerificationId == verificationId);

            if (verification == null)
                return ApiResponse<PaymentVerificationDetailDto>.ErrorResponse("Payment verification not found");

            var daysRemaining = (verification.VerificationEndDate - DateTime.UtcNow).Days;

            var details = new PaymentVerificationDetailDto
            {
                VerificationId = verification.VerificationId,
                OrderId = verification.OrderId,
                SellerId = verification.SellerId,
                SellerShopName = verification.Seller.ShopName,
                Amount = verification.Amount,
                VerificationStartDate = verification.VerificationStartDate,
                VerificationEndDate = verification.VerificationEndDate,
                Status = verification.Status,
                CustomerAction = verification.CustomerAction,
                ActionDate = verification.ActionDate,
                ReleasedDate = verification.ReleasedDate,
                ReleasedBy = verification.ReleasedBy,
                Notes = verification.Notes,
                DaysRemaining = daysRemaining > 0 ? daysRemaining : 0,
                IsExpired = DateTime.UtcNow > verification.VerificationEndDate,
                IsDisputed = verification.Order.CustomerReportedProblem,
                OrderStatus = verification.Order.OrderStatus,
                CustomerName = verification.Order.Customer.FullName,
                CustomerEmail = verification.Order.Customer.User.Email,
                SellerEmail = verification.Seller.User.Email,
                SellerPhone = verification.Seller.ContactPhone
            };

            return ApiResponse<PaymentVerificationDetailDto>.SuccessResponse(details);
        }

        public async Task<ApiResponse<bool>> ManualPaymentActionAsync(int adminId, ManualPaymentActionDto dto)
        {
            var verification = await _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer).ThenInclude(c => c.User)
                .Include(pv => pv.Seller).ThenInclude(s => s.User)
                .FirstOrDefaultAsync(pv => pv.VerificationId == dto.VerificationId);

            if (verification == null)
                return ApiResponse<bool>.ErrorResponse("Payment verification not found");

            var admin = await _context.Admins
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AdminId == adminId);

            if (admin == null)
                return ApiResponse<bool>.ErrorResponse("Admin not found");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var notifications = new List<Notification>();

                switch (dto.Action.ToLower())
                {
                    case "release":
                        verification.Status = nameof(PaymentStatus.ManuallyReleased);
                        verification.ReleasedDate = DateTime.UtcNow;
                        verification.ReleasedBy = admin.User.Email;
                        verification.Notes = dto.Reason;
                        verification.Order.PaymentStatus = nameof(PaymentStatus.Released);
                        verification.Order.OrderStatus = nameof(OrderStatus.Completed);

                        // Update seller metrics
                        var seller = verification.Seller;
                        seller.TotalSales += verification.Amount;
                        seller.TotalOrders++;

                        if (dto.NotifySeller)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = seller.UserId,
                                NotificationType = nameof(NotificationType.PaymentReleased),
                                Message = $"Payment of {verification.Amount:C} has been manually released by admin",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }

                        if (dto.NotifyCustomer)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = verification.Order.Customer.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Payment for order #{verification.OrderId} has been released to seller",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }
                        break;

                    case "hold":
                        verification.Status = nameof(PaymentStatus.Frozen);
                        verification.Notes = dto.Reason;
                        verification.Order.PaymentStatus = nameof(PaymentStatus.Frozen);

                        if (dto.NotifySeller)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = verification.Seller.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Payment for order #{verification.OrderId} is on hold",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }

                        if (dto.NotifyCustomer)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = verification.Order.Customer.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Payment for order #{verification.OrderId} is on hold",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }
                        break;

                    case "dispute":
                        verification.Status = nameof(PaymentStatus.Disputed);
                        verification.Notes = dto.Reason;
                        verification.Order.PaymentStatus = nameof(PaymentStatus.Disputed);
                        verification.Order.OrderStatus = nameof(OrderStatus.Disputed);

                        if (dto.NotifySeller)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = verification.Seller.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Payment for order #{verification.OrderId} is under dispute",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }

                        if (dto.NotifyCustomer)
                        {
                            notifications.Add(new Notification
                            {
                                UserId = verification.Order.Customer.UserId,
                                NotificationType = nameof(NotificationType.SystemAlert),
                                Message = $"Payment for order #{verification.OrderId} is under dispute",
                                DetailedMessage = dto.Reason,
                                RelatedEntityId = verification.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow
                            });
                        }
                        break;

                    default:
                        return ApiResponse<bool>.ErrorResponse("Invalid action. Use 'Release', 'Hold', or 'Dispute'");
                }

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ApiResponse<bool>.SuccessResponse(true, $"Payment {dto.Action} action completed successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<bool>.ErrorResponse($"Failed to process payment action: {ex.Message}");
            }
        }

        // ============================================
        // CATEGORY MANAGEMENT (Simple CRUD)
        // ============================================

        public async Task<ApiResponse<List<CategoryWithStatsDto>>> GetAllCategoriesAsync()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.CategoryName)
                .ToListAsync();

            var categoryStats = new List<CategoryWithStatsDto>();

            foreach (var category in categories)
            {
                var products = await _context.Products
                    .Where(p => p.CategoryId == category.CategoryId)
                    .ToListAsync();

                categoryStats.Add(new CategoryWithStatsDto
                {
                    CategoryId = category.CategoryId,
                    CategoryName = category.CategoryName,
                    Description = category.Description,
                    CategoryImage = category.CategoryImage,
                    IsActive = category.IsActive,
                    DateCreated = category.DateCreated,
                    TotalProducts = products.Count,
                    ActiveProducts = products.Count(p => p.IsActive)
                });
            }

            return ApiResponse<List<CategoryWithStatsDto>>.SuccessResponse(categoryStats);
        }

        public async Task<ApiResponse<CategoryWithStatsDto>> GetCategoryByIdAsync(int categoryId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId);

            if (category == null)
                return ApiResponse<CategoryWithStatsDto>.ErrorResponse("Category not found");

            var products = await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
            var stats = new CategoryWithStatsDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                CategoryImage = category.CategoryImage,
                IsActive = category.IsActive,
                DateCreated = category.DateCreated,
                TotalProducts = products.Count,
                ActiveProducts = products.Count(p => p.IsActive)
            };

            return ApiResponse<CategoryWithStatsDto>.SuccessResponse(stats);
        }

        public async Task<ApiResponse<int>> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var existingCategory = await _context.Categories
                .AnyAsync(c => c.CategoryName.ToLower() == dto.CategoryName.ToLower());

            if (existingCategory)
                return ApiResponse<int>.ErrorResponse("Category with this name already exists");


            var category = new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                IsActive = true,
                DateCreated = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return ApiResponse<int>.SuccessResponse(category.CategoryId, "Category created successfully");
        }

        public async Task<ApiResponse<bool>> UpdateCategoryAsync(UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(dto.CategoryId);

            if (category == null)
                return ApiResponse<bool>.ErrorResponse("Category not found");

            var duplicateName = await _context.Categories
                .AnyAsync(c => c.CategoryName.ToLower() == dto.CategoryName.ToLower() &&
                              c.CategoryId != dto.CategoryId);

            if (duplicateName)
                return ApiResponse<bool>.ErrorResponse("Category with this name already exists");

            

            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Category updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteCategoryAsync(int categoryId)
        {
            var category = await _context.Categories.FindAsync(categoryId);

            if (category == null)
                return ApiResponse<bool>.ErrorResponse("Category not found");

            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == categoryId);

            if (hasProducts)
                return ApiResponse<bool>.ErrorResponse("Cannot delete category with products. Please deactivate it instead.");

            if (!string.IsNullOrEmpty(category.CategoryImage))
            {
                var publicId = _cloudinaryService.GetPublicIdFromUrl(category.CategoryImage);
                if (!string.IsNullOrEmpty(publicId))
                    await _cloudinaryService.DeleteImageAsync(publicId);
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Category deleted successfully");
        }

        public async Task<ApiResponse<string>> UploadCategoryImageAsync(int categoryId, IFormFile image)
        {
            var category = await _context.Categories.FindAsync(categoryId);

            if (category == null)
                return ApiResponse<string>.ErrorResponse("Category not found");

            if (!string.IsNullOrEmpty(category.CategoryImage))
            {
                var oldPublicId = _cloudinaryService.GetPublicIdFromUrl(category.CategoryImage);
                if (!string.IsNullOrEmpty(oldPublicId))
                    await _cloudinaryService.DeleteImageAsync(oldPublicId);
            }

            var imageUrl = await _cloudinaryService.UploadImageAsync(image, "categories");

            if (string.IsNullOrEmpty(imageUrl))
                return ApiResponse<string>.ErrorResponse("Failed to upload image");

            category.CategoryImage = imageUrl;
            await _context.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(imageUrl, "Category image uploaded successfully");
        }

        // ============================================
        // PRODUCT MODERATION
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminProductListDto>>> GetAllProductsAsync(ProductFilterParams filterParams)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .Include(p => p.Reviews.Where(r => r.IsApproved))
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filterParams.SearchTerm))
            {
                var searchLower = filterParams.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.ProductName.ToLower().Contains(searchLower) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchLower)));
            }

            if (!string.IsNullOrEmpty(filterParams.Category))
                query = query.Where(p => p.Category.CategoryName == filterParams.Category);

            if (filterParams.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filterParams.MinPrice.Value);

            if (filterParams.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filterParams.MaxPrice.Value);

            if (filterParams.SellerId.HasValue)
                query = query.Where(p => p.SellerId == filterParams.SellerId.Value);

            if (filterParams.InStock.HasValue)
                query = filterParams.InStock.Value
                    ? query.Where(p => p.StockQuantity > 0)
                    : query.Where(p => p.StockQuantity == 0);

            if (filterParams.IsActive.HasValue)
                query = query.Where(p => p.IsActive == filterParams.IsActive.Value);

            // Apply sorting
            query = query.ApplySorting(filterParams.SortBy ?? "DateListed", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = new List<AdminProductListDto>();

            foreach (var product in pagedResult.Items)
            {
                var totalSales = await _context.OrderItems
                    .Where(oi => oi.ProductId == product.ProductId &&
                                oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                    .SumAsync(oi => oi.Quantity);

                mappedItems.Add(new AdminProductListDto
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductImage = product.ProductImage,
                    Price = product.Price,
                    StockQuantity = product.StockQuantity,
                    IsActive = product.IsActive,
                    CategoryName = product.Category.CategoryName,
                    SellerId = product.SellerId,
                    SellerShopName = product.Seller.ShopName,
                    DateListed = product.DateListed,
                    TotalReviews = product.Reviews.Count,
                    AverageRating = product.Reviews.Any()
                        ? (decimal)product.Reviews.Average(r => r.Rating)
                        : 0,
                    TotalSales = totalSales
                });
            }

            return ApiResponse<PagedResult<AdminProductListDto>>.SuccessResponse(new PagedResult<AdminProductListDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<bool>> UpdateProductStatusAsync(UpdateProductStatusDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Seller).ThenInclude(s => s.User)
                .FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);

            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Product not found");

            product.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();

            // Notify seller
            var notification = new Notification
            {
                UserId = product.Seller.UserId,
                NotificationType = nameof(NotificationType.SystemAlert),
                Message = dto.IsActive
                    ? $"Product '{product.ProductName}' has been activated by admin"
                    : $"Product '{product.ProductName}' has been deactivated by admin",
                DetailedMessage = dto.Reason ?? "No reason provided",
                RelatedEntityId = product.ProductId,
                RelatedEntityType = "Product",
                DateCreated = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Product status updated successfully");
        }

        // ============================================
        // REVIEW MODERATION
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminReviewListDto>>> GetAllReviewsAsync(PaginationParams paginationParams)
        {
            var query = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .OrderByDescending(r => r.DatePosted)
                .AsQueryable();

            var pagedResult = await query.ToPagedResultAsync(paginationParams);

            var mappedItems = pagedResult.Items.Select(r => new AdminReviewListDto
            {
                ReviewId = r.ReviewId,
                ProductId = r.ProductId,
                ProductName = r.Product.ProductName,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                DatePosted = r.DatePosted,
                IsApproved = r.IsApproved,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                ModerationNotes = r.ModerationNotes
            }).ToList();

            return ApiResponse<PagedResult<AdminReviewListDto>>.SuccessResponse(new PagedResult<AdminReviewListDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<bool>> ModerateReviewAsync(ModerateReviewDto dto)
        {
            var review = await _context.Reviews
                .Include(r => r.Product).ThenInclude(p => p.Seller)
                .Include(r => r.Customer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(r => r.ReviewId == dto.ReviewId);

            if (review == null)
                return ApiResponse<bool>.ErrorResponse("Review not found");

            review.IsApproved = dto.IsApproved;
            review.ModerationNotes = dto.ModerationNotes;
            review.ModeratedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify customer
            var notification = new Notification
            {
                UserId = review.Customer.UserId,
                NotificationType = nameof(NotificationType.SystemAlert),
                Message = dto.IsApproved
                    ? "Your review has been approved"
                    : "Your review has been rejected",
                DetailedMessage = dto.ModerationNotes ?? "No reason provided",
                RelatedEntityId = review.ProductId,
                RelatedEntityType = "Review",
                DateCreated = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Review moderation completed");
        }



        // ============================================
        // STAFF MANAGEMENT
        // ============================================

        public async Task<ApiResponse<List<StaffListDto>>> GetAllDeliveryStaffAsync()
        {
            var staff = await _context.DeliveryStaffs
                .Include(ds => ds.User)
                .OrderBy(ds => ds.FullName)
                .Select(ds => new StaffListDto
                {
                    StaffId = ds.DeliveryStaffId,
                    StaffType = "DeliveryStaff",
                    UserId = ds.UserId,
                    FullName = ds.FullName,
                    Email = ds.User.Email!,
                    Phone = ds.Phone,
                    DateJoined = ds.DateJoined,
                    IsActive = ds.IsActive
                })
                .ToListAsync();

            return ApiResponse<List<StaffListDto>>.SuccessResponse(staff);
        }

        public async Task<ApiResponse<int>> CreateDeliveryStaffAsync(CreateDeliveryStaffDto dto)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return ApiResponse<int>.ErrorResponse("Email already registered");
            }

            // Map CreateDeliveryStaffDto to RegisterDeliveryStaffDto
            var registerDto = new RegisterDeliveryStaffDto
            {
                Email = dto.Email,
                Password = dto.Password,
                ConfirmPassword = dto.Password, // Admin sets password
                FullName = dto.FullName,
                Phone = dto.Phone,
                VehicleType = dto.VehicleType,
                VehicleNumber = dto.VehicleNumber,
                LicenseNumber = null, // Not in CreateDeliveryStaffDto
                AssignedArea = dto.AssignedArea,
                EmployeeCode = null, // Auto-generated in AuthService
                Department = null // Not needed for delivery staff
            };

            var authResponse = await _authService.RegisterDeliveryStaffAsync(registerDto);

            if (!authResponse.Success)
                return ApiResponse<int>.ErrorResponse(authResponse.Message);

            return ApiResponse<int>.SuccessResponse(
                authResponse.UserInfo!.ActorInfo!.ActorId,
                "Delivery staff created successfully");
        }

        public async Task<ApiResponse<List<StaffListDto>>> GetAllSupportStaffAsync()
        {
            var staff = await _context.SupportStaffs
                .Include(ss => ss.User)
                .OrderBy(ss => ss.FullName)
                .Select(ss => new StaffListDto
                {
                    StaffId = ss.SupportStaffId,
                    StaffType = "SupportStaff",
                    UserId = ss.UserId,
                    FullName = ss.FullName,
                    Email = ss.User.Email!,
                    Phone = ss.Phone,
                    EmployeeCode = ss.EmployeeCode,
                    DateJoined = ss.DateJoined,
                    IsActive = ss.IsActive
                })
                .ToListAsync();

            return ApiResponse<List<StaffListDto>>.SuccessResponse(staff);
        }

        public async Task<ApiResponse<int>> CreateSupportStaffAsync(CreateSupportStaffDto dto)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return ApiResponse<int>.ErrorResponse("Email already registered");
            }

            // Check if employee code is unique
            if (!string.IsNullOrEmpty(dto.EmployeeCode))
            {
                var existingCode = await _context.SupportStaffs
                    .AnyAsync(s => s.EmployeeCode == dto.EmployeeCode);
                if (existingCode)
                {
                    return ApiResponse<int>.ErrorResponse("Employee code already exists");
                }
            }

            // Map CreateSupportStaffDto to RegisterSupportStaffDto
            var registerDto = new RegisterSupportStaffDto
            {
                Email = dto.Email,
                Password = dto.Password,
                ConfirmPassword = dto.Password, // Admin sets password
                FullName = dto.FullName,
                EmployeeCode = dto.EmployeeCode, // Required in CreateSupportStaffDto
                Department = dto.Department,
                Phone = dto.Phone,
                Specialization = dto.Specialization
            };

            var authResponse = await _authService.RegisterSupportStaffAsync(registerDto);

            if (!authResponse.Success)
                return ApiResponse<int>.ErrorResponse(authResponse.Message);

            return ApiResponse<int>.SuccessResponse(
                authResponse.UserInfo!.ActorInfo!.ActorId,
                "Support staff created successfully");
        }

        public async Task<ApiResponse<List<StaffListDto>>> GetAllInventoryManagersAsync()
        {
            var managers = await _context.InventoryManagers
                .Include(im => im.User)
                .OrderBy(im => im.FullName)
                .Select(im => new StaffListDto
                {
                    StaffId = im.InventoryManagerId,
                    StaffType = "InventoryManager",
                    UserId = im.UserId,
                    FullName = im.FullName,
                    Email = im.User.Email!,
                    Phone = im.Phone,
                    EmployeeCode = im.EmployeeCode,
                    DateJoined = im.DateJoined,
                    IsActive = im.IsActive
                })
                .ToListAsync();

            return ApiResponse<List<StaffListDto>>.SuccessResponse(managers);
        }

        public async Task<ApiResponse<int>> CreateInventoryManagerAsync(CreateInventoryManagerDto dto)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return ApiResponse<int>.ErrorResponse("Email already registered");
            }

            // Check if employee code is unique (if provided)
            if (!string.IsNullOrEmpty(dto.EmployeeCode))
            {
                var existingCode = await _context.InventoryManagers
                    .AnyAsync(i => i.EmployeeCode == dto.EmployeeCode);
                if (existingCode)
                {
                    return ApiResponse<int>.ErrorResponse("Employee code already exists");
                }
            }

            // Map CreateInventoryManagerDto to RegisterInventoryManagerDto
            var registerDto = new RegisterInventoryManagerDto
            {
                Email = dto.Email,
                Password = dto.Password,
                ConfirmPassword = dto.Password, // Admin sets password
                FullName = dto.FullName,
                EmployeeCode = dto.EmployeeCode, // Optional, will be auto-generated if null
                Department = dto.Department,
                Phone = dto.Phone,
                AssignedWarehouse = dto.AssignedWarehouse
            };

            var authResponse = await _authService.RegisterInventoryManagerAsync(registerDto);

            if (!authResponse.Success)
                return ApiResponse<int>.ErrorResponse(authResponse.Message);

            return ApiResponse<int>.SuccessResponse(
                authResponse.UserInfo!.ActorInfo!.ActorId,
                "Inventory manager created successfully");
        }

        public async Task<ApiResponse<bool>> UpdateStaffStatusAsync(string staffType, int staffId, bool isActive)
        {
            switch (staffType.ToLower())
            {
                case "deliverystaff":
                    var deliveryStaff = await _context.DeliveryStaffs.FindAsync(staffId);
                    if (deliveryStaff == null)
                        return ApiResponse<bool>.ErrorResponse("Delivery staff not found");
                    deliveryStaff.IsActive = isActive;
                    break;

                case "supportstaff":
                    var supportStaff = await _context.SupportStaffs.FindAsync(staffId);
                    if (supportStaff == null)
                        return ApiResponse<bool>.ErrorResponse("Support staff not found");
                    supportStaff.IsActive = isActive;
                    break;

                case "inventorymanager":
                    var inventoryManager = await _context.InventoryManagers.FindAsync(staffId);
                    if (inventoryManager == null)
                        return ApiResponse<bool>.ErrorResponse("Inventory manager not found");
                    inventoryManager.IsActive = isActive;
                    break;

                default:
                    return ApiResponse<bool>.ErrorResponse("Invalid staff type");
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.SuccessResponse(true, "Staff status updated successfully");
        }

        // ============================================
        // COMPLAINT OVERSIGHT
        // ============================================

        public async Task<ApiResponse<PagedResult<AdminComplaintSummaryDto>>> GetAllComplaintsAsync(PaginationParams paginationParams)
        {
            var query = _context.Complaints
                .Include(c => c.Customer)
                .Include(c => c.AssignedSupportStaff)
                .OrderByDescending(c => c.DateReported)
                .AsQueryable();

            var pagedResult = await query.ToPagedResultAsync(paginationParams);

            var mappedItems = pagedResult.Items.Select(c => new AdminComplaintSummaryDto
            {
                ComplaintId = c.ComplaintId,
                OrderId = c.OrderId,
                CustomerName = c.Customer.FullName,
                ComplaintType = c.ComplaintType,
                Status = c.Status,
                Priority = c.Priority ?? "Medium",
                DateReported = c.DateReported,
                AssignedStaffName = c.AssignedSupportStaff?.FullName
            }).ToList();

            return ApiResponse<PagedResult<AdminComplaintSummaryDto>>.SuccessResponse(new PagedResult<AdminComplaintSummaryDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        // ============================================
        // SALES REPORTS
        // ============================================

        public async Task<ApiResponse<SalesReportDto>> GenerateSalesReportAsync(SalesReportFilterDto filterDto)
        {
            var fromDate = filterDto.FromDate ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = filterDto.ToDate ?? DateTime.UtcNow;

            var ordersQuery = _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ThenInclude(p => p.Category)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Seller)
                .Where(o => o.OrderDate >= fromDate && o.OrderDate <= toDate);

            if (filterDto.SellerId.HasValue)
                ordersQuery = ordersQuery.Where(o => o.OrderItems.Any(oi => oi.SellerId == filterDto.SellerId.Value));

            if (filterDto.CategoryId.HasValue)
                ordersQuery = ordersQuery.Where(o => o.OrderItems.Any(oi => oi.Product.CategoryId == filterDto.CategoryId.Value));

            var orders = await ordersQuery.ToListAsync();

            var report = new SalesReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                TotalRevenue = orders.Sum(o => o.GrandTotal),
                TotalBuyerProtectionFees = orders.Sum(o => o.BuyerProtectionFee),
                TotalOrders = orders.Count,
                CompletedOrders = orders.Count(o => o.OrderStatus == nameof(OrderStatus.Completed)),
                CancelledOrders = orders.Count(o => o.OrderStatus == nameof(OrderStatus.Cancelled)),
                DisputedOrders = orders.Count(o => o.OrderStatus == nameof(OrderStatus.Disputed)),
                AverageOrderValue = orders.Any() ? orders.Average(o => o.GrandTotal) : 0
            };

            // Top Sellers
            var sellerSales = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                .GroupBy(oi => oi.SellerId)
                .Select(g => new
                {
                    SellerId = g.Key,
                    TotalSales = g.Sum(oi => oi.Subtotal),
                    TotalOrders = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalSales)
                .Take(10)
                .ToList();

            foreach (var sellerSale in sellerSales)
            {
                var seller = await _context.Sellers.FindAsync(sellerSale.SellerId);
                if (seller != null)
                {
                    report.TopSellers.Add(new TopSellerDto
                    {
                        SellerId = seller.SellerId,
                        ShopName = seller.ShopName,
                        TotalSales = sellerSale.TotalSales,
                        TotalOrders = sellerSale.TotalOrders,
                        AverageRating = seller.OverallRating
                    });
                }
            }

            // Top Categories
            var categorySales = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                .GroupBy(oi => oi.Product.CategoryId)
                .Select(g => new
                {
                    CategoryId = g.Key,
                    TotalRevenue = g.Sum(oi => oi.Subtotal),
                    TotalOrders = g.Select(oi => oi.OrderId).Distinct().Count(),
                    TotalProducts = g.Select(oi => oi.ProductId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(10)
                .ToList();

            foreach (var categorySale in categorySales)
            {
                var category = await _context.Categories.FindAsync(categorySale.CategoryId);
                if (category != null)
                {
                    report.TopCategories.Add(new TopCategoryDto
                    {
                        CategoryId = category.CategoryId,
                        CategoryName = category.CategoryName,
                        TotalProducts = categorySale.TotalProducts,
                        TotalRevenue = categorySale.TotalRevenue,
                        TotalOrders = categorySale.TotalOrders
                    });
                }
            }

            // Sales Trend
            var groupBy = filterDto.GroupBy?.ToLower() ?? "day";
            var salesTrend = new List<SalesTrendDto>();

            switch (groupBy)
            {
                case "day":
                    salesTrend = orders
                        .GroupBy(o => o.OrderDate.Date)
                        .Select(g => new SalesTrendDto
                        {
                            Date = g.Key,
                            Period = g.Key.ToString("yyyy-MM-dd"),
                            Revenue = g.Where(o => o.OrderStatus == nameof(OrderStatus.Completed)).Sum(o => o.GrandTotal),
                            Orders = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToList();
                    break;

                case "week":
                    salesTrend = orders
                        .GroupBy(o => new
                        {
                            Year = o.OrderDate.Year,
                            Week = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                                o.OrderDate,
                                System.Globalization.CalendarWeekRule.FirstDay,
                                DayOfWeek.Monday)
                        })
                        .Select(g => new SalesTrendDto
                        {
                            Date = g.Min(o => o.OrderDate),
                            Period = $"Week {g.Key.Week}, {g.Key.Year}",
                            Revenue = g.Where(o => o.OrderStatus == nameof(OrderStatus.Completed)).Sum(o => o.GrandTotal),
                            Orders = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToList();
                    break;

                case "month":
                    salesTrend = orders
                        .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                        .Select(g => new SalesTrendDto
                        {
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                            Revenue = g.Where(o => o.OrderStatus == nameof(OrderStatus.Completed)).Sum(o => o.GrandTotal),
                            Orders = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToList();
                    break;

                case "year":
                    salesTrend = orders
                        .GroupBy(o => o.OrderDate.Year)
                        .Select(g => new SalesTrendDto
                        {
                            Date = new DateTime(g.Key, 1, 1),
                            Period = g.Key.ToString(),
                            Revenue = g.Where(o => o.OrderStatus == nameof(OrderStatus.Completed)).Sum(o => o.GrandTotal),
                            Orders = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToList();
                    break;
            }

            report.SalesTrend = salesTrend;

            return ApiResponse<SalesReportDto>.SuccessResponse(report);
        }

        // ============================================
        // SYSTEM CONFIGURATION
        // ============================================

        public async Task<ApiResponse<List<SystemConfigDto>>> GetSystemConfigurationsAsync()
        {
            var configs = await _context.SystemConfigurations
                .OrderBy(c => c.ConfigKey)
                .Select(c => new SystemConfigDto
                {
                    ConfigId = c.ConfigId,
                    ConfigKey = c.ConfigKey,
                    ConfigValue = c.ConfigValue,
                    Description = c.Description,
                    LastUpdated = c.LastUpdated,
                    UpdatedBy = c.UpdatedBy
                })
                .ToListAsync();

            return ApiResponse<List<SystemConfigDto>>.SuccessResponse(configs);
        }

        public async Task<ApiResponse<bool>> UpdateSystemConfigurationAsync(UpdateSystemConfigDto dto)
        {
            var config = await _context.SystemConfigurations.FindAsync(dto.ConfigId);

            if (config == null)
                return ApiResponse<bool>.ErrorResponse("Configuration not found");

            config.ConfigValue = dto.ConfigValue;
            config.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Configuration updated successfully");
        }

        // ============================================
        // DASHBOARD & STATISTICS
        // ============================================

        public async Task<ApiResponse<AdminDashboardDto>> GetDashboardStatsAsync()
        {
            var nowUtc = DateTime.UtcNow;
            var todayStart = DateTime.SpecifyKind(nowUtc.Date, DateTimeKind.Utc);
            var todayEnd = todayStart.AddDays(1);

            var thisMonthStart = DateTime.SpecifyKind(
                new DateTime(nowUtc.Year, nowUtc.Month, 1),
                DateTimeKind.Utc
            );
            var nextMonthStart = thisMonthStart.AddMonths(1);

            Console.WriteLine($"=== DASHBOARD DEBUG ({nowUtc:yyyy-MM-dd HH:mm:ss} UTC) ===");
            Console.WriteLine($"Today Range: {todayStart:yyyy-MM-dd HH:mm:ss} to {todayEnd:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine($"Month Range: {thisMonthStart:yyyy-MM-dd HH:mm:ss} to {nextMonthStart:yyyy-MM-dd HH:mm:ss}");

            var dashboard = new AdminDashboardDto();

            // Platform Stats
            dashboard.PlatformStats = new PlatformStatsDto
            {
                TotalSellers = await _context.Sellers.CountAsync(),
                ActiveSellers = await _context.Sellers.CountAsync(s => s.IsActive),
                TotalCustomers = await _context.Customers.CountAsync(),
                ActiveCustomers = await _context.Customers.CountAsync(c => c.IsActive),
                TotalProducts = await _context.Products.CountAsync(),
                ActiveProducts = await _context.Products.CountAsync(p => p.IsActive),
                TotalCategories = await _context.Categories.CountAsync(c => c.IsActive),
                TotalStaff = await _context.DeliveryStaffs.CountAsync() +
                            await _context.SupportStaffs.CountAsync() +
                            await _context.InventoryManagers.CountAsync()
            };

            // Revenue Stats - Use DeliveryDate for revenue (when order was actually completed)
            var completedOrders = await _context.Orders
                .Where(o => o.OrderStatus == nameof(OrderStatus.Completed))
                .ToListAsync();

            Console.WriteLine($"\n=== COMPLETED ORDERS ({completedOrders.Count} total) ===");
            foreach (var order in completedOrders)
            {
                var orderDate = DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc);
                var deliveryDate = order.DeliveryDate.HasValue
                    ? DateTime.SpecifyKind(order.DeliveryDate.Value, DateTimeKind.Utc)
                    : orderDate;

                Console.WriteLine($"Order #{order.OrderId}:");
                Console.WriteLine($"  OrderDate: {orderDate:yyyy-MM-dd HH:mm:ss} UTC");
                Console.WriteLine($"  DeliveryDate: {(order.DeliveryDate.HasValue ? deliveryDate.ToString("yyyy-MM-dd HH:mm:ss") + " UTC" : "NULL (using OrderDate)")}");
                Console.WriteLine($"  BuyerProtectionFee: {order.BuyerProtectionFee:C}");
                Console.WriteLine($"  Is Delivered Today?: {deliveryDate >= todayStart && deliveryDate < todayEnd}");
                Console.WriteLine($"  Is Delivered This Month?: {deliveryDate >= thisMonthStart && deliveryDate < nextMonthStart}");
            }

            // Normalize delivery dates for revenue calculations
            // Use DeliveryDate if available, otherwise fall back to OrderDate
            var normalizedCompletedOrders = completedOrders.Select(o => new
            {
                Order = o,
                RevenueDate = o.DeliveryDate.HasValue
                    ? DateTime.SpecifyKind(o.DeliveryDate.Value, DateTimeKind.Utc)
                    : DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc)
            }).ToList();

            var totalPlatformRevenue = completedOrders.Sum(o => o.BuyerProtectionFee);

            // Revenue from orders DELIVERED/COMPLETED today
            var todayCompletedOrders = normalizedCompletedOrders
                .Where(x => x.RevenueDate >= todayStart && x.RevenueDate < todayEnd)
                .Select(x => x.Order)
                .ToList();
            var todayPlatformRevenue = todayCompletedOrders.Sum(o => o.BuyerProtectionFee);

            // Revenue from orders DELIVERED/COMPLETED this month
            var monthCompletedOrders = normalizedCompletedOrders
                .Where(x => x.RevenueDate >= thisMonthStart && x.RevenueDate < nextMonthStart)
                .Select(x => x.Order)
                .ToList();
            var thisMonthPlatformRevenue = monthCompletedOrders.Sum(o => o.BuyerProtectionFee);

            Console.WriteLine($"\nREVENUE SUMMARY:");
            Console.WriteLine($"  Total: {totalPlatformRevenue:C} ({completedOrders.Count} orders)");
            Console.WriteLine($"  Today: {todayPlatformRevenue:C} ({todayCompletedOrders.Count} orders)");
            Console.WriteLine($"  This Month: {thisMonthPlatformRevenue:C} ({monthCompletedOrders.Count} orders)");

            dashboard.RevenueStats = new RevenueStatsDto
            {
                TotalRevenue = totalPlatformRevenue,
                TodayRevenue = todayPlatformRevenue,
                ThisMonthRevenue = thisMonthPlatformRevenue,
                TotalBuyerProtectionFees = totalPlatformRevenue,
                PendingPayments = await _context.PaymentVerifications
                    .Where(pv => pv.Status == nameof(PaymentStatus.Pending) ||
                                pv.Status == nameof(PaymentStatus.VerificationPeriod))
                    .SumAsync(pv => pv.Amount),
                ReleasedPayments = await _context.PaymentVerifications
                    .Where(pv => pv.Status == nameof(PaymentStatus.Released) ||
                                pv.Status == nameof(PaymentStatus.AutoReleased) ||
                                pv.Status == nameof(PaymentStatus.ManuallyReleased))
                    .SumAsync(pv => pv.Amount)
            };

            // User Stats - Check registration dates
            var allSellers = await _context.Sellers.ToListAsync();
            var allCustomers = await _context.Customers.ToListAsync();

            Console.WriteLine($"\n=== SELLERS ({allSellers.Count} total) ===");
            foreach (var seller in allSellers)
            {
                var regDate = DateTime.SpecifyKind(seller.DateRegistered, DateTimeKind.Utc);
                Console.WriteLine($"Seller #{seller.SellerId} ({seller.ShopName}):");
                Console.WriteLine($"  DateRegistered: {regDate:yyyy-MM-dd HH:mm:ss} UTC");
                Console.WriteLine($"  Is Today?: {regDate >= todayStart && regDate < todayEnd}");
                Console.WriteLine($"  Is This Month?: {regDate >= thisMonthStart && regDate < nextMonthStart}");
            }

            Console.WriteLine($"\n=== CUSTOMERS ({allCustomers.Count} total) ===");
            foreach (var customer in allCustomers)
            {
                var regDate = DateTime.SpecifyKind(customer.DateRegistered, DateTimeKind.Utc);
                Console.WriteLine($"Customer #{customer.CustomerId} ({customer.FullName}):");
                Console.WriteLine($"  DateRegistered: {regDate:yyyy-MM-dd HH:mm:ss} UTC");
                Console.WriteLine($"  Is Today?: {regDate >= todayStart && regDate < todayEnd}");
                Console.WriteLine($"  Is This Month?: {regDate >= thisMonthStart && regDate < nextMonthStart}");
            }

            // Normalize dates for sellers and customers
            var normalizedSellers = allSellers.Select(s => new
            {
                Seller = s,
                NormalizedDate = DateTime.SpecifyKind(s.DateRegistered, DateTimeKind.Utc)
            }).ToList();

            var normalizedCustomers = allCustomers.Select(c => new
            {
                Customer = c,
                NormalizedDate = DateTime.SpecifyKind(c.DateRegistered, DateTimeKind.Utc)
            }).ToList();

            var newSellersToday = normalizedSellers
                .Count(x => x.NormalizedDate >= todayStart && x.NormalizedDate < todayEnd);
            var newCustomersToday = normalizedCustomers
                .Count(x => x.NormalizedDate >= todayStart && x.NormalizedDate < todayEnd);
            var newSellersThisMonth = normalizedSellers
                .Count(x => x.NormalizedDate >= thisMonthStart && x.NormalizedDate < nextMonthStart);
            var newCustomersThisMonth = normalizedCustomers
                .Count(x => x.NormalizedDate >= thisMonthStart && x.NormalizedDate < nextMonthStart);

            dashboard.UserStats = new UserStatsDto
            {
                NewSellersToday = newSellersToday,
                NewCustomersToday = newCustomersToday,
                NewSellersThisMonth = newSellersThisMonth,
                NewCustomersThisMonth = newCustomersThisMonth
            };

            Console.WriteLine($"\nUSER STATS SUMMARY:");
            Console.WriteLine($"  New Sellers Today: {newSellersToday}");
            Console.WriteLine($"  New Customers Today: {newCustomersToday}");
            Console.WriteLine($"  New Sellers This Month: {newSellersThisMonth}");
            Console.WriteLine($"  New Customers This Month: {newCustomersThisMonth}");

            // Order Stats - Use OrderDate for order counts (when order was placed)
            var allOrders = await _context.Orders.ToListAsync();
            var normalizedOrders = allOrders.Select(o => new
            {
                Order = o,
                NormalizedDate = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc)
            }).ToList();

            var todayOrdersCount = normalizedOrders
                .Count(x => x.NormalizedDate >= todayStart && x.NormalizedDate < todayEnd);
            var monthOrdersCount = normalizedOrders
                .Count(x => x.NormalizedDate >= thisMonthStart && x.NormalizedDate < nextMonthStart);

            dashboard.OrderStats = new OrderStatsDto
            {
                TotalOrders = allOrders.Count,
                PendingOrders = allOrders.Count(o =>
                    o.OrderStatus == nameof(OrderStatus.Pending) ||
                    o.OrderStatus == nameof(OrderStatus.Confirmed) ||
                    o.OrderStatus == nameof(OrderStatus.PickedUp) ||
                    o.OrderStatus == nameof(OrderStatus.OnTheWay)),
                CompletedOrders = allOrders.Count(o => o.OrderStatus == nameof(OrderStatus.Completed)),
                DisputedOrders = allOrders.Count(o => o.OrderStatus == nameof(OrderStatus.Disputed)),
                TodayOrders = todayOrdersCount,
                ThisMonthOrders = monthOrdersCount,
                AverageOrderValue = completedOrders.Any() ? completedOrders.Average(o => o.GrandTotal) : 0
            };

            Console.WriteLine($"\nORDER STATS SUMMARY:");
            Console.WriteLine($"  Today Orders: {todayOrdersCount}");
            Console.WriteLine($"  This Month Orders: {monthOrdersCount}");
            Console.WriteLine("===================\n");

            // Recent Activities
            dashboard.RecentActivities = new List<RecentActivityDto>
    {
        new RecentActivityDto
        {
            ActivityType = "New Order",
            Description = todayOrdersCount == 1
                ? "1 new order today"
                : $"{todayOrdersCount} new orders today",
            Timestamp = nowUtc,
            RelatedEntity = "Orders"
        },
        new RecentActivityDto
        {
            ActivityType = "New Seller",
            Description = newSellersToday == 1
                ? "1 new seller registered today"
                : $"{newSellersToday} new sellers registered today",
            Timestamp = nowUtc.AddHours(-1),
            RelatedEntity = "Sellers"
        },
        new RecentActivityDto
        {
            ActivityType = "New Customer",
            Description = newCustomersToday == 1
                ? "1 new customer registered today"
                : $"{newCustomersToday} new customers registered today",
            Timestamp = nowUtc.AddHours(-2),
            RelatedEntity = "Customers"
        },
        new RecentActivityDto
        {
            ActivityType = "Platform Revenue",
            Description = $"PKR {todayPlatformRevenue:N2} earned today (2% fees)",
            Timestamp = nowUtc.AddHours(-3),
            RelatedEntity = "Revenue"
        }
    };

            // Pending Verifications (top 5)
            var pendingVerifications = await _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer)
                .Include(pv => pv.Seller)
                .Where(pv => pv.Status == nameof(PaymentStatus.Pending) ||
                            pv.Status == nameof(PaymentStatus.VerificationPeriod))
                .OrderBy(pv => pv.VerificationEndDate)
                .Take(5)
                .ToListAsync();

            dashboard.PendingVerifications = pendingVerifications
                .Select(MapToPaymentVerificationSummary)
                .ToList();

            // Recent Complaints (top 5)
            var recentComplaints = await _context.Complaints
                .Include(c => c.Customer)
                .Include(c => c.AssignedSupportStaff)
                .Where(c => c.Status != nameof(ComplaintStatus.Closed))
                .OrderByDescending(c => c.DateReported)
                .Take(5)
                .ToListAsync();

            dashboard.RecentComplaints = recentComplaints.Select(c => new AdminComplaintSummaryDto
            {
                ComplaintId = c.ComplaintId,
                OrderId = c.OrderId,
                CustomerName = c.Customer.FullName,
                ComplaintType = c.ComplaintType,
                Status = c.Status,
                Priority = c.Priority ?? "Medium",
                DateReported = c.DateReported,
                AssignedStaffName = c.AssignedSupportStaff?.FullName
            }).ToList();

            return ApiResponse<AdminDashboardDto>.SuccessResponse(dashboard);
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private PaymentVerificationSummaryDto MapToPaymentVerificationSummary(PaymentVerification pv)
        {
            var daysRemaining = (pv.VerificationEndDate - DateTime.UtcNow).Days;

            return new PaymentVerificationSummaryDto
            {
                VerificationId = pv.VerificationId,
                OrderId = pv.OrderId,
                SellerId = pv.SellerId,
                SellerShopName = pv.Seller.ShopName,
                Amount = pv.Amount,
                VerificationStartDate = pv.VerificationStartDate,
                VerificationEndDate = pv.VerificationEndDate,
                Status = pv.Status,
                CustomerAction = pv.CustomerAction,
                ActionDate = pv.ActionDate,
                ReleasedDate = pv.ReleasedDate,
                ReleasedBy = pv.ReleasedBy,
                DaysRemaining = daysRemaining > 0 ? daysRemaining : 0,
                IsExpired = DateTime.UtcNow > pv.VerificationEndDate,
                IsDisputed = pv.Order.CustomerReportedProblem
            };
        }
    }
}

