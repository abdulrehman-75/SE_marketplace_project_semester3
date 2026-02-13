using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Helpers;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.DeliveryStaff;
using MarketPlace.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class DeliveryStaffService : IDeliveryStaffService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentCalculator _paymentCalculator;

        public DeliveryStaffService(
            ApplicationDbContext context,
            IPaymentCalculator paymentCalculator)
        {
            _context = context;
            _paymentCalculator = paymentCalculator;
        }

        // ================== PROFILE MANAGEMENT ==================

        public async Task<DeliveryStaffProfileDto?> GetProfileAsync(int deliveryStaffId)
        {
            var staff = await _context.DeliveryStaffs
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DeliveryStaffId == deliveryStaffId);

            if (staff == null) return null;

            var successRate = staff.TotalDeliveries > 0
                ? (decimal)staff.SuccessfulDeliveries / staff.TotalDeliveries * 100
                : 0;

            return new DeliveryStaffProfileDto
            {
                DeliveryStaffId = staff.DeliveryStaffId,
                FullName = staff.FullName,
                Email = staff.User.Email!,
                Phone = staff.Phone,
                VehicleType = staff.VehicleType,
                VehicleNumber = staff.VehicleNumber,
                LicenseNumber = staff.LicenseNumber,
                AssignedArea = staff.AssignedArea,
                CurrentLocation = staff.CurrentLocation,
                IsAvailable = staff.IsAvailable,
                IsActive = staff.IsActive,
                DateJoined = staff.DateJoined,
                TotalDeliveries = staff.TotalDeliveries,
                SuccessfulDeliveries = staff.SuccessfulDeliveries,
                SuccessRate = Math.Round(successRate, 2)
            };
        }

        public async Task<bool> UpdateProfileAsync(int deliveryStaffId, UpdateDeliveryStaffProfileDto dto)
        {
            var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
            if (staff == null) return false;

            staff.Phone = dto.Phone;
            staff.VehicleType = dto.VehicleType;
            staff.VehicleNumber = dto.VehicleNumber;
            staff.LicenseNumber = dto.LicenseNumber;
            staff.CurrentLocation = dto.CurrentLocation;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAvailabilityAsync(int deliveryStaffId, UpdateAvailabilityDto dto)
        {
            var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
            if (staff == null) return false;

            staff.IsAvailable = dto.IsAvailable;
            if (!string.IsNullOrEmpty(dto.CurrentLocation))
            {
                staff.CurrentLocation = dto.CurrentLocation;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // ================== ORDER ASSIGNMENT (SELF-ASSIGNMENT) ==================

        public async Task<PagedResult<AvailableOrderDto>> GetAvailableOrdersAsync(int deliveryStaffId, DeliveryFilterParams filterParams)
        {
            var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
            if (staff == null)
                return new PagedResult<AvailableOrderDto>();

            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .Where(o => o.DeliveryStaffId == null &&
                           o.OrderStatus == nameof(OrderStatus.Confirmed))
                .AsQueryable();

            // 🔍 TEMPORARILY COMMENTED OUT FOR TESTING
            // if (!string.IsNullOrEmpty(staff.AssignedArea))
            // {
            //     query = query.Where(o => o.DeliveryCity != null &&
            //                             o.DeliveryCity.ToLower().Contains(staff.AssignedArea.ToLower()));
            // }

            // Apply filters
            if (!string.IsNullOrEmpty(filterParams.City))
            {
                query = query.Where(o => o.DeliveryCity != null &&
                                        o.DeliveryCity.ToLower() == filterParams.City.ToLower());
            }

            if (filterParams.FromDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= filterParams.FromDate.Value);
            }

            if (filterParams.ToDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= filterParams.ToDate.Value);
            }

            query = query.ApplySorting(filterParams.SortBy ?? "OrderDate", filterParams.SortOrder);

            var pagedEntities = await query.ToPagedResultAsync(filterParams);

            var dtoItems = pagedEntities.Items.Select(o => new AvailableOrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                GrandTotal = o.GrandTotal,
                OrderStatus = o.OrderStatus,
                DeliveryAddress = o.DeliveryAddress,
                DeliveryCity = o.DeliveryCity,
                CustomerPhone = o.CustomerPhone,
                CustomerName = o.Customer.FullName,
                TotalItems = o.OrderItems.Sum(oi => oi.Quantity),
                IsCOD = o.PaymentMethod == "Cash on Delivery"
            }).ToList();

            return new PagedResult<AvailableOrderDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<bool> SelfAssignOrderAsync(int deliveryStaffId, int orderId)
        {
            var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
            if (staff == null || !staff.IsAvailable || !staff.IsActive)
                return false;

            var confirmedStatus = nameof(OrderStatus.Confirmed);

            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .FirstOrDefaultAsync(o => o.OrderId == orderId &&
                                         o.OrderStatus == confirmedStatus &&
                                         o.DeliveryStaffId == null);

            if (order == null)
                return false;

            // 🔍 TEMPORARILY COMMENTED OUT FOR TESTING - Area validation removed
            // if (!string.IsNullOrEmpty(staff.AssignedArea) &&
            //     !string.IsNullOrEmpty(order.DeliveryCity))
            // {
            //     if (!order.DeliveryCity.Contains(staff.AssignedArea, StringComparison.OrdinalIgnoreCase))
            //     {
            //         return false; // Don't allow assignment outside assigned area
            //     }
            // }

            order.DeliveryStaffId = deliveryStaffId;
            staff.TotalDeliveries++;

            // Create notification for customer
            var notification = new Notification
            {
                UserId = order.Customer.UserId,
                NotificationType = nameof(NotificationType.OrderShipped),
                Message = $"Your order #{orderId} has been assigned to delivery staff: {staff.FullName}",
                RelatedEntityId = orderId,
                RelatedEntityType = "Order",
                DateCreated = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            // Create notifications for all sellers in this order
            var sellerIds = order.OrderItems.Select(oi => oi.SellerId).Distinct();
            foreach (var sellerId in sellerIds)
            {
                var seller = await _context.Sellers.FindAsync(sellerId);
                if (seller != null)
                {
                    var sellerNotification = new Notification
                    {
                        UserId = seller.UserId,
                        NotificationType = nameof(NotificationType.OrderShipped),
                        Message = $"Order #{orderId} has been assigned to delivery staff",
                        RelatedEntityId = orderId,
                        RelatedEntityType = "Order",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(sellerNotification);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // ================== ASSIGNED ORDERS MANAGEMENT ==================

        public async Task<PagedResult<AssignedOrderDto>> GetMyAssignedOrdersAsync(int deliveryStaffId, DeliveryFilterParams filterParams)
        {
            var cancelledStatus = nameof(OrderStatus.Cancelled);

            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .Where(o => o.DeliveryStaffId == deliveryStaffId && o.OrderStatus != cancelledStatus)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filterParams.OrderStatus))
            {
                query = query.Where(o => o.OrderStatus == filterParams.OrderStatus);
            }

            if (filterParams.FromDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= filterParams.FromDate.Value);
            }

            if (filterParams.ToDate.HasValue)
            {
                var toDateEnd = filterParams.ToDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(o => o.OrderDate <= toDateEnd);
            }

            if (!string.IsNullOrEmpty(filterParams.City))
            {
                var cityLower = filterParams.City.ToLower();
                query = query.Where(o => o.DeliveryCity != null &&
                                        o.DeliveryCity.ToLower() == cityLower);
            }

            var sortBy = filterParams.SortBy ?? "OrderDate";
            var sortOrder = string.IsNullOrEmpty(filterParams.SortOrder) ? "desc" : filterParams.SortOrder;
            query = query.ApplySorting(sortBy, sortOrder);

            var pagedEntities = await query.ToPagedResultAsync(filterParams);

            var dtoItems = pagedEntities.Items.Select(o => MapToAssignedOrderDto(o)).ToList();

            return new PagedResult<AssignedOrderDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<AssignedOrderDto?> GetOrderDetailsAsync(int deliveryStaffId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .FirstOrDefaultAsync(o => o.OrderId == orderId &&
                                         o.DeliveryStaffId == deliveryStaffId);

            if (order == null) return null;

            return MapToAssignedOrderDto(order);
        }

        // ================== ORDER STATUS UPDATES ==================

        public async Task<bool> UpdateOrderStatusAsync(int deliveryStaffId, UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId &&
                                         o.DeliveryStaffId == deliveryStaffId);

            if (order == null)
                return false;

            // Validate status transition
            if (!IsValidStatusTransition(order.OrderStatus, dto.NewStatus))
                return false;

            // Validate only allowed statuses for delivery staff
            var pickedUpStatus = nameof(OrderStatus.PickedUp);
            var onTheWayStatus = nameof(OrderStatus.OnTheWay);

            if (dto.NewStatus != pickedUpStatus && dto.NewStatus != onTheWayStatus)
                return false;

            order.OrderStatus = dto.NewStatus;

            // Create notification for customer
            var customerNotification = new Notification
            {
                UserId = order.Customer.UserId,
                NotificationType = nameof(NotificationType.OrderShipped),
                Message = $"Your order #{dto.OrderId} status updated: {dto.NewStatus}",
                RelatedEntityId = dto.OrderId,
                RelatedEntityType = "Order",
                DateCreated = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(customerNotification);

            // Notify all sellers about status change
            var sellerIds = order.OrderItems.Select(oi => oi.SellerId).Distinct();
            foreach (var sellerId in sellerIds)
            {
                var seller = await _context.Sellers.FindAsync(sellerId);
                if (seller != null)
                {
                    var sellerNotification = new Notification
                    {
                        UserId = seller.UserId,
                        NotificationType = nameof(NotificationType.OrderShipped),
                        Message = $"Order #{dto.OrderId} status: {dto.NewStatus}",
                        RelatedEntityId = dto.OrderId,
                        RelatedEntityType = "Order",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(sellerNotification);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAsDeliveredAsync(int deliveryStaffId, MarkAsDeliveredDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var onTheWayStatus = nameof(OrderStatus.OnTheWay);
                var deliveredStatus = nameof(OrderStatus.Delivered);

                var order = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Seller)
                    .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId &&
                                             o.DeliveryStaffId == deliveryStaffId);

                if (order == null)
                    return false;

                // Validate order status - must be OnTheWay
                if (order.OrderStatus != onTheWayStatus)
                    return false;

                // Update order status
                order.OrderStatus = deliveredStatus;
                order.DeliveryDate = DateTime.UtcNow;

                // Start verification period
                order.VerificationPeriodStart = DateTime.UtcNow;
                order.VerificationPeriodEnd = _paymentCalculator.CalculateVerificationEndDate(
                    DateTime.UtcNow, 7);

                order.PaymentStatus = nameof(PaymentStatus.VerificationPeriod);

                // Create payment verifications for each seller
                var sellerGroups = order.OrderItems.GroupBy(oi => oi.SellerId);
                foreach (var group in sellerGroups)
                {
                    var amount = group.Sum(oi => oi.Subtotal);
                    var seller = await _context.Sellers.FindAsync(group.Key);

                    var verification = new PaymentVerification
                    {
                        OrderId = dto.OrderId,
                        SellerId = group.Key,
                        Amount = amount,
                        VerificationStartDate = order.VerificationPeriodStart.Value,
                        VerificationEndDate = order.VerificationPeriodEnd.Value,
                        Status = nameof(PaymentStatus.VerificationPeriod),
                        CustomerAction = string.Empty,
                        ActionDate = null,
                        ReleasedDate = null
                    };
                    _context.PaymentVerifications.Add(verification);

                    // Notify each seller
                    if (seller != null)
                    {
                        var sellerNotification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.OrderDelivered),
                            Message = $"Order #{dto.OrderId} has been delivered. Verification period started.",
                            RelatedEntityId = dto.OrderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(sellerNotification);
                    }
                }

                // Update delivery staff success count
                var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
                if (staff != null)
                {
                    staff.SuccessfulDeliveries++;
                }

                // ✅ Update customer metrics when payment is collected (COD)
                var customer = await _context.Customers.FindAsync(order.CustomerId);
                if (customer != null)
                {
                    customer.TotalOrders++;
                    customer.TotalSpent += order.GrandTotal;
                }

                // Create notification for customer
                var customerNotification = new Notification
                {
                    UserId = order.Customer.UserId,
                    NotificationType = nameof(NotificationType.OrderDelivered),
                    Message = $"Your order #{dto.OrderId} has been delivered. Please verify within 7 days to release payment to the seller.",
                    RelatedEntityId = dto.OrderId,
                    RelatedEntityType = "Order",
                    DateCreated = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(customerNotification);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<bool> UnassignOrderAsync(int deliveryStaffId, UnassignOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
                if (staff == null || !staff.IsActive)
                    return false;

                var order = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Seller)
                    .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId &&
                                             o.DeliveryStaffId == deliveryStaffId);

                if (order == null)
                    return false;

                // Only allow unassignment if order is not yet delivered
                var confirmedStatus = nameof(OrderStatus.Confirmed);
                var pickedUpStatus = nameof(OrderStatus.PickedUp);
                var onTheWayStatus = nameof(OrderStatus.OnTheWay);

                var allowedStatuses = new[] { confirmedStatus, pickedUpStatus, onTheWayStatus };

                if (!allowedStatuses.Contains(order.OrderStatus))
                    return false;

                // Revert order status back to Confirmed
                order.OrderStatus = confirmedStatus;
                order.DeliveryStaffId = null;

                // Update staff metrics - decrease total deliveries
                if (staff.TotalDeliveries > 0)
                {
                    staff.TotalDeliveries--;
                }

                // Create notification for customer
                var customerNotification = new Notification
                {
                    UserId = order.Customer.UserId,
                    NotificationType = nameof(NotificationType.OrderShipped),
                    Message = $"Order #{dto.OrderId} delivery staff has been changed. A new delivery staff will be assigned soon.",
                    DetailedMessage = $"Reason: {dto.UnassignReason}",
                    RelatedEntityId = dto.OrderId,
                    RelatedEntityType = "Order",
                    DateCreated = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(customerNotification);

                // Notify all sellers about the unassignment
                var sellerIds = order.OrderItems.Select(oi => oi.SellerId).Distinct();
                foreach (var sellerId in sellerIds)
                {
                    var seller = await _context.Sellers.FindAsync(sellerId);
                    if (seller != null)
                    {
                        var sellerNotification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.OrderShipped),
                            Message = $"Order #{dto.OrderId} needs new delivery staff",
                            DetailedMessage = $"Previous delivery staff unassigned. Reason: {dto.UnassignReason}",
                            RelatedEntityId = dto.OrderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(sellerNotification);
                    }
                }

                // Notify admins about the unassignment for monitoring
                var admins = await _context.Admins.Include(a => a.User).ToListAsync();
                foreach (var admin in admins)
                {
                    var adminNotification = new Notification
                    {
                        UserId = admin.UserId,
                        NotificationType = nameof(NotificationType.SystemAlert),
                        Message = $"Delivery staff {staff.FullName} unassigned from Order #{dto.OrderId}",
                        DetailedMessage = dto.UnassignReason,
                        RelatedEntityId = dto.OrderId,
                        RelatedEntityType = "Order",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(adminNotification);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ================== DELIVERY HISTORY ==================

        public async Task<PagedResult<DeliveryHistoryDto>> GetDeliveryHistoryAsync(int deliveryStaffId, DeliveryFilterParams filterParams)
        {
            var deliveredStatus = nameof(OrderStatus.Delivered);
            var completedStatus = nameof(OrderStatus.Completed);

            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .Where(o => o.DeliveryStaffId == deliveryStaffId &&
                           (o.OrderStatus == deliveredStatus || o.OrderStatus == completedStatus))
                .AsQueryable();

            if (filterParams.FromDate.HasValue)
            {
                query = query.Where(o => o.DeliveryDate >= filterParams.FromDate.Value);
            }

            if (filterParams.ToDate.HasValue)
            {
                var toDateEnd = filterParams.ToDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(o => o.DeliveryDate <= toDateEnd);
            }

            if (!string.IsNullOrEmpty(filterParams.City))
            {
                var cityLower = filterParams.City.ToLower();
                query = query.Where(o => o.DeliveryCity != null &&
                                        o.DeliveryCity.ToLower() == cityLower);
            }

            var sortBy = filterParams.SortBy ?? "DeliveryDate";
            var sortOrder = string.IsNullOrEmpty(filterParams.SortOrder) ? "desc" : filterParams.SortOrder;
            query = query.ApplySorting(sortBy, sortOrder);

            var pagedEntities = await query.ToPagedResultAsync(filterParams);

            var dtoItems = pagedEntities.Items.Select(o => new DeliveryHistoryDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                DeliveryDate = o.DeliveryDate,
                GrandTotal = o.GrandTotal,
                OrderStatus = o.OrderStatus,
                DeliveryAddress = o.DeliveryAddress,
                DeliveryCity = o.DeliveryCity,
                CustomerName = o.Customer.FullName,
                CustomerPhone = o.CustomerPhone,
                TotalItems = o.OrderItems.Sum(oi => oi.Quantity),
                WasSuccessful = o.OrderStatus == completedStatus || o.OrderStatus == deliveredStatus
            }).ToList();

            return new PagedResult<DeliveryHistoryDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        // ================== STATISTICS ==================

        public async Task<DeliveryStatsDto> GetMyStatisticsAsync(int deliveryStaffId)
        {
            var staff = await _context.DeliveryStaffs.FindAsync(deliveryStaffId);
            if (staff == null)
                return new DeliveryStatsDto();

            var today = DateTime.UtcNow.Date;
            var deliveredStatus = nameof(OrderStatus.Delivered);
            var completedStatus = nameof(OrderStatus.Completed);
            var cancelledStatus = nameof(OrderStatus.Cancelled);

            var pendingCount = await _context.Orders
                .CountAsync(o => o.DeliveryStaffId == deliveryStaffId &&
                                o.OrderStatus != deliveredStatus &&
                                o.OrderStatus != completedStatus &&
                                o.OrderStatus != cancelledStatus);

            var todaysCount = await _context.Orders
                .CountAsync(o => o.DeliveryStaffId == deliveryStaffId &&
                                o.DeliveryDate != null &&
                                o.DeliveryDate.Value.Date == today);

            var totalAmountDelivered = await _context.Orders
                .Where(o => o.DeliveryStaffId == deliveryStaffId &&
                           (o.OrderStatus == deliveredStatus || o.OrderStatus == completedStatus))
                .SumAsync(o => (decimal?)o.GrandTotal) ?? 0m;

            var successRate = staff.TotalDeliveries > 0
                ? (decimal)staff.SuccessfulDeliveries / staff.TotalDeliveries * 100
                : 0;

            return new DeliveryStatsDto
            {
                TotalDeliveries = staff.TotalDeliveries,
                SuccessfulDeliveries = staff.SuccessfulDeliveries,
                PendingDeliveries = pendingCount,
                TodaysDeliveries = todaysCount,
                SuccessRate = Math.Round(successRate, 2),
                TotalAmountDelivered = totalAmountDelivered
            };
        }

        // ================== HELPER METHODS ==================

        private AssignedOrderDto MapToAssignedOrderDto(Order order)
        {
            return new AssignedOrderDto
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
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
                CustomerName = order.Customer.FullName,
                TotalItems = order.OrderItems.Sum(oi => oi.Quantity),
                OrderItems = order.OrderItems.Select(oi => new DeliveryOrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductImage = oi.ProductImage,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    Subtotal = oi.Subtotal,
                    SellerShopName = oi.Product?.Seller?.ShopName ?? "N/A"
                }).ToList()
            };
        }

        private bool IsValidStatusTransition(string currentStatus, string newStatus)
        {
            var validTransitions = new Dictionary<string, string[]>
            {
                [nameof(OrderStatus.Confirmed)] = new[] { nameof(OrderStatus.PickedUp) },
                [nameof(OrderStatus.PickedUp)] = new[] { nameof(OrderStatus.OnTheWay) },
                [nameof(OrderStatus.OnTheWay)] = new string[] { }
            };

            if (!validTransitions.ContainsKey(currentStatus))
                return false;

            return validTransitions[currentStatus].Contains(newStatus);
        }

        private bool IsBackwardTransition(string currentStatus, string newStatus)
        {
            var statusHierarchy = new[]
            {
                nameof(OrderStatus.Pending),
                nameof(OrderStatus.Confirmed),
                nameof(OrderStatus.PickedUp),
                nameof(OrderStatus.OnTheWay),
                nameof(OrderStatus.Delivered),
                nameof(OrderStatus.Completed)
            };

            var currentIndex = Array.IndexOf(statusHierarchy, currentStatus);
            var newIndex = Array.IndexOf(statusHierarchy, newStatus);

            if (currentIndex == -1 || newIndex == -1)
                return false;

            return newIndex < currentIndex;
        }
    }
}