using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.SupportStaff;
using MarketPlace.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class SupportStaffService : ISupportStaffService
    {
        private readonly ApplicationDbContext _context;

        public SupportStaffService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================== PROFILE MANAGEMENT ==================

        public async Task<SupportStaffProfileDto?> GetProfileAsync(int supportStaffId)
        {
            try
            {
                var staff = await _context.SupportStaffs
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SupportStaffId == supportStaffId);

                if (staff == null) return null;

                return new SupportStaffProfileDto
                {
                    SupportStaffId = staff.SupportStaffId,
                    FullName = staff.FullName,
                    Email = staff.User?.Email ?? "",
                    EmployeeCode = staff.EmployeeCode,
                    Department = staff.Department,
                    Phone = staff.Phone,
                    Specialization = staff.Specialization,
                    IsActive = staff.IsActive,
                    DateJoined = staff.DateJoined,
                    TotalCasesHandled = staff.TotalCasesHandled,
                    ActiveCases = staff.ActiveCases
                };
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error in GetProfileAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> UpdateProfileAsync(int supportStaffId, UpdateSupportStaffProfileDto dto)
        {
            try
            {
                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null) return false;

                staff.Phone = dto.Phone;
                staff.Specialization = dto.Specialization;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateProfileAsync: {ex.Message}");
                return false;
            }
        }

        // ================== COMPLAINT MANAGEMENT - LIST & VIEW ==================

        public async Task<PagedResult<ComplaintListDto>> GetAllComplaintsAsync(int supportStaffId, ComplaintFilterParams filterParams)
        {
            try
            {
                var query = _context.Complaints
                    .Include(c => c.Customer)
                    .Include(c => c.AssignedSupportStaff)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(filterParams.Status))
                {
                    query = query.Where(c => c.Status == filterParams.Status);
                }

                if (!string.IsNullOrEmpty(filterParams.Priority))
                {
                    query = query.Where(c => c.Priority == filterParams.Priority);
                }

                if (!string.IsNullOrEmpty(filterParams.ComplaintType))
                {
                    query = query.Where(c => c.ComplaintType == filterParams.ComplaintType);
                }

                if (filterParams.AssignedToMe == true)
                {
                    query = query.Where(c => c.AssignedSupportStaffId == supportStaffId);
                }

                if (filterParams.Unassigned == true)
                {
                    query = query.Where(c => c.AssignedSupportStaffId == null);
                }

                if (filterParams.FromDate.HasValue)
                {
                    query = query.Where(c => c.DateReported >= filterParams.FromDate.Value);
                }

                if (filterParams.ToDate.HasValue)
                {
                    query = query.Where(c => c.DateReported <= filterParams.ToDate.Value);
                }

                // Apply sorting
                query = query.ApplySorting(filterParams.SortBy ?? "DateReported",
                                          filterParams.SortOrder == "asc" ? "asc" : "desc");

                // Get paged entities
                var pagedEntities = await query.ToPagedResultAsync(filterParams);

                // Map to DTOs
                var dtoItems = pagedEntities.Items.Select(c => new ComplaintListDto
                {
                    ComplaintId = c.ComplaintId,
                    OrderId = c.OrderId,
                    CustomerId = c.CustomerId,
                    CustomerName = c.Customer?.FullName ?? "Unknown",
                    ComplaintType = c.ComplaintType,
                    Status = c.Status,
                    Priority = c.Priority ?? "Medium",
                    DateReported = c.DateReported,
                    AssignedSupportStaffId = c.AssignedSupportStaffId,
                    AssignedStaffName = c.AssignedSupportStaff?.FullName,
                    IsAssignedToMe = c.AssignedSupportStaffId == supportStaffId,
                    ShortDescription = c.Description != null && c.Description.Length > 100
                        ? c.Description.Substring(0, 100) + "..."
                        : c.Description ?? ""
                }).ToList();

                return new PagedResult<ComplaintListDto>
                {
                    Items = dtoItems,
                    PageNumber = pagedEntities.PageNumber,
                    PageSize = pagedEntities.PageSize,
                    TotalCount = pagedEntities.TotalCount
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllComplaintsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<ComplaintDetailDto?> GetComplaintDetailsAsync(int supportStaffId, int complaintId)
        {
            try
            {
                var complaint = await _context.Complaints
                    .Include(c => c.Customer)
                        .ThenInclude(cu => cu.User)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Product)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Seller)
                    .Include(c => c.AssignedSupportStaff)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(c => c.ComplaintId == complaintId);

                if (complaint == null) return null;

                // Get conversation/messages
                var conversation = await BuildComplaintConversationAsync(complaint);

                // Safe seller extraction with null checks
                var sellers = complaint.Order?.OrderItems?
                    .Where(oi => oi.Product != null && oi.Seller != null)
                    .Select(oi => oi.Seller)
                    .Where(s => s != null)
                    .DistinctBy(s => s.SellerId)
                    .Select(s => new ComplaintSellerInfoDto
                    {
                        SellerId = s!.SellerId,
                        ShopName = s.ShopName ?? "",
                        ContactEmail = s.ContactEmail,
                        ContactPhone = s.ContactPhone,
                        OverallRating = s.OverallRating
                    }).ToList() ?? new List<ComplaintSellerInfoDto>();

                return new ComplaintDetailDto
                {
                    ComplaintId = complaint.ComplaintId,
                    OrderId = complaint.OrderId,
                    ComplaintType = complaint.ComplaintType,
                    Description = complaint.Description ?? "",
                    Status = complaint.Status,
                    Priority = complaint.Priority ?? "Medium",
                    DateReported = complaint.DateReported,
                    ResolvedDate = complaint.ResolvedDate,
                    ResolutionNotes = complaint.ResolutionNotes,
                    AttachedImages = complaint.AttachedImages,
                    CustomerId = complaint.CustomerId,
                    CustomerName = complaint.Customer?.FullName ?? "Unknown",
                    CustomerEmail = complaint.Customer?.User?.Email,
                    CustomerPhone = complaint.Customer?.Phone,
                    AssignedSupportStaffId = complaint.AssignedSupportStaffId,
                    AssignedStaffName = complaint.AssignedSupportStaff?.FullName,
                    Order = complaint.Order != null ? new ComplaintOrderDto
                    {
                        OrderId = complaint.Order.OrderId,
                        OrderDate = complaint.Order.OrderDate,
                        GrandTotal = complaint.Order.GrandTotal,
                        OrderStatus = complaint.Order.OrderStatus,
                        PaymentStatus = complaint.Order.PaymentStatus,
                        DeliveryDate = complaint.Order.DeliveryDate,
                        ProblemDescription = complaint.Order.ProblemDescription,
                        OrderItems = complaint.Order.OrderItems?
                            .Where(oi => oi.Product != null && oi.Seller != null)
                            .Select(oi => new ComplaintOrderItemDto
                            {
                                OrderItemId = oi.OrderItemId,
                                ProductName = oi.ProductName ?? "",
                                ProductImage = oi.ProductImage,
                                Quantity = oi.Quantity,
                                UnitPrice = oi.UnitPrice,
                                Subtotal = oi.Subtotal,
                                SellerId = oi.SellerId,
                                SellerShopName = oi.Seller?.ShopName ?? ""
                            }).ToList() ?? new List<ComplaintOrderItemDto>(),
                        Sellers = sellers
                    } : new ComplaintOrderDto
                    {
                        OrderId = complaint.OrderId,
                        OrderDate = DateTime.MinValue,
                        GrandTotal = 0,
                        OrderStatus = "Unknown",
                        PaymentStatus = "Unknown"
                    },
                    Conversation = conversation
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetComplaintDetailsAsync: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
        }

        // ================== COMPLAINT ASSIGNMENT ==================

        public async Task<bool> SelfAssignComplaintAsync(int supportStaffId, int complaintId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null || !staff.IsActive)
                    return false;

                var complaint = await _context.Complaints
                    .FirstOrDefaultAsync(c => c.ComplaintId == complaintId &&
                                             c.AssignedSupportStaffId == null);

                if (complaint == null)
                    return false;

                complaint.AssignedSupportStaffId = supportStaffId;
                complaint.Status = nameof(ComplaintStatus.InProgress);

                staff.TotalCasesHandled++;
                staff.ActiveCases++;

                AddSystemMessage(complaintId, $"Complaint assigned to {staff.FullName}");

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SelfAssignComplaintAsync: {ex.Message}");
                await transaction.RollbackAsync();
                return false;
            }
        }

        // ================== COMPLAINT STATUS & PRIORITY UPDATES ==================

        public async Task<bool> UpdateComplaintStatusAsync(int supportStaffId, UpdateComplaintStatusDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var complaint = await _context.Complaints
                    .Include(c => c.AssignedSupportStaff)
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

                if (complaint == null)
                    return false;

                var validStatuses = new[] {
                    nameof(ComplaintStatus.InProgress),
                    nameof(ComplaintStatus.Resolved),
                    nameof(ComplaintStatus.Closed),
                    nameof(ComplaintStatus.Escalated)
                };

                if (!validStatuses.Contains(dto.NewStatus))
                    return false;

                var oldStatus = complaint.Status;
                complaint.Status = dto.NewStatus;

                if (dto.NewStatus == nameof(ComplaintStatus.Closed) ||
                    dto.NewStatus == nameof(ComplaintStatus.Resolved))
                {
                    var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                    if (staff != null && staff.ActiveCases > 0)
                    {
                        staff.ActiveCases--;
                    }

                    if (dto.NewStatus == nameof(ComplaintStatus.Resolved))
                    {
                        complaint.ResolvedDate = DateTime.UtcNow;
                    }
                }

                AddSystemMessage(dto.ComplaintId, $"Status changed from {oldStatus} to {dto.NewStatus}");

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateComplaintStatusAsync: {ex.Message}");
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> UpdateComplaintPriorityAsync(int supportStaffId, UpdateComplaintPriorityDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var complaint = await _context.Complaints
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

                if (complaint == null)
                    return false;

                var validPriorities = new[] { "Low", "Medium", "High", "Urgent" };
                if (!validPriorities.Contains(dto.Priority))
                    return false;

                var oldPriority = complaint.Priority;
                complaint.Priority = dto.Priority;

                AddSystemMessage(dto.ComplaintId, $"Priority changed from {oldPriority} to {dto.Priority}");

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateComplaintPriorityAsync: {ex.Message}");
                await transaction.RollbackAsync();
                return false;
            }
        }

        // ================== COMPLAINT RESOLUTION ==================

        public async Task<bool> AddComplaintNoteAsync(int supportStaffId, AddComplaintNoteDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var complaint = await _context.Complaints.FindAsync(dto.ComplaintId);
                if (complaint == null)
                    return false;

                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null)
                    return false;

                var message = new ComplaintMessage
                {
                    ComplaintId = dto.ComplaintId,
                    SenderType = "SupportStaff",
                    SenderName = staff.FullName,
                    Message = dto.Message,
                    Timestamp = DateTime.UtcNow,
                    IsInternal = dto.IsInternal
                };

                _context.Set<ComplaintMessage>().Add(message);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddComplaintNoteAsync: {ex.Message}");
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> ResolveComplaintAsync(int supportStaffId, ResolveComplaintDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var complaint = await _context.Complaints
                    .Include(c => c.Customer)
                        .ThenInclude(c => c.User)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Seller)
                                .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

                if (complaint == null)
                    return false;

                complaint.Status = nameof(ComplaintStatus.Resolved);
                complaint.ResolutionNotes = dto.ResolutionNotes;
                complaint.ResolvedDate = DateTime.UtcNow;

                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff != null && staff.ActiveCases > 0)
                {
                    staff.ActiveCases--;
                }

                var message = new ComplaintMessage
                {
                    ComplaintId = dto.ComplaintId,
                    SenderType = "SupportStaff",
                    SenderName = staff?.FullName ?? "Support Staff",
                    Message = $"Complaint resolved: {dto.ResolutionNotes}",
                    Timestamp = DateTime.UtcNow,
                    IsInternal = false
                };
                _context.Set<ComplaintMessage>().Add(message);

                if (dto.NotifyCustomer && complaint.Customer?.UserId != null)
                {
                    var notification = new Notification
                    {
                        UserId = complaint.Customer.UserId,
                        NotificationType = nameof(NotificationType.ComplaintUpdate),
                        Message = $"Your complaint #{complaint.ComplaintId} has been resolved",
                        DetailedMessage = dto.ResolutionNotes,
                        RelatedEntityId = complaint.ComplaintId,
                        RelatedEntityType = "Complaint",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }

                if (complaint.Order?.OrderItems != null)
                {
                    var affectedSellers = complaint.Order.OrderItems
                        .Where(oi => oi.Seller != null)
                        .Select(oi => oi.Seller!)
                        .DistinctBy(s => s.SellerId)
                        .ToList();

                    foreach (var seller in affectedSellers)
                    {
                        if (seller.UserId != null)
                        {
                            var sellerNotification = new Notification
                            {
                                UserId = seller.UserId,
                                NotificationType = nameof(NotificationType.ComplaintUpdate),
                                Message = $"Complaint resolved for Order #{complaint.OrderId}",
                                DetailedMessage = $"A complaint about order #{complaint.OrderId} has been resolved by support. Resolution: {dto.ResolutionNotes}",
                                RelatedEntityId = complaint.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow,
                                IsRead = false
                            };
                            _context.Notifications.Add(sellerNotification);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ResolveComplaintAsync: {ex.Message}");
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> EscalateToAdminAsync(int supportStaffId, EscalateToAdminDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var complaint = await _context.Complaints
                    .Include(c => c.Order)
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

                if (complaint == null)
                    return false;

                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null)
                    return false;

                complaint.Status = nameof(ComplaintStatus.Escalated);

                if (complaint.Order != null)
                {
                    complaint.Order.OrderStatus = nameof(OrderStatus.Disputed);
                }

                var message = new ComplaintMessage
                {
                    ComplaintId = dto.ComplaintId,
                    SenderType = "SupportStaff",
                    SenderName = staff.FullName,
                    Message = $"Escalated to Admin: {dto.EscalationReason}",
                    Timestamp = DateTime.UtcNow,
                    IsInternal = true
                };
                _context.Set<ComplaintMessage>().Add(message);

                var admins = await _context.Admins.Include(a => a.User).ToListAsync();
                foreach (var admin in admins)
                {
                    if (admin.UserId != null)
                    {
                        var notification = new Notification
                        {
                            UserId = admin.UserId,
                            NotificationType = nameof(NotificationType.SystemAlert),
                            Message = $"Complaint #{complaint.ComplaintId} escalated by {staff.FullName}",
                            DetailedMessage = dto.EscalationReason,
                            RelatedEntityId = complaint.ComplaintId,
                            RelatedEntityType = "Complaint",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(notification);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in EscalateToAdminAsync: {ex.Message}");
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeEscalateComplaintAsync(int supportStaffId, DeEscalateComplaintDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null || !staff.IsActive)
                    return false;

                var complaint = await _context.Complaints
                    .Include(c => c.Customer)
                        .ThenInclude(c => c.User)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Seller)
                                .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

                if (complaint == null)
                    return false;

                if (complaint.Status != nameof(ComplaintStatus.Escalated))
                    return false;

                complaint.Status = nameof(ComplaintStatus.InProgress);

                if (dto.ReassignToMe)
                {
                    complaint.AssignedSupportStaffId = supportStaffId;
                    staff.ActiveCases++;
                }
                else
                {
                    complaint.AssignedSupportStaffId = null;
                }

                if (complaint.Order != null && complaint.Order.OrderStatus == nameof(OrderStatus.Disputed))
                {
                    if (complaint.Order.DeliveryDate.HasValue)
                    {
                        complaint.Order.OrderStatus = nameof(OrderStatus.Delivered);
                    }
                    else if (complaint.Order.DeliveryStaffId.HasValue)
                    {
                        complaint.Order.OrderStatus = nameof(OrderStatus.Confirmed);
                    }
                }

                var message = new ComplaintMessage
                {
                    ComplaintId = dto.ComplaintId,
                    SenderType = "SupportStaff",
                    SenderName = staff.FullName,
                    Message = $"De-escalated from Admin: {dto.DeEscalationNotes}",
                    Timestamp = DateTime.UtcNow,
                    IsInternal = true
                };
                _context.Set<ComplaintMessage>().Add(message);

                if (complaint.Customer?.UserId != null)
                {
                    var customerNotification = new Notification
                    {
                        UserId = complaint.Customer.UserId,
                        NotificationType = nameof(NotificationType.ComplaintUpdate),
                        Message = $"Your complaint #{complaint.ComplaintId} is being actively handled by our support team",
                        DetailedMessage = "Your case has been reviewed and is now being processed for resolution.",
                        RelatedEntityId = complaint.ComplaintId,
                        RelatedEntityType = "Complaint",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(customerNotification);
                }

                if (complaint.Order?.OrderItems != null)
                {
                    var affectedSellers = complaint.Order.OrderItems
                        .Where(oi => oi.Seller != null)
                        .Select(oi => oi.Seller!)
                        .DistinctBy(s => s.SellerId)
                        .ToList();

                    foreach (var seller in affectedSellers)
                    {
                        if (seller.UserId != null)
                        {
                            var sellerNotification = new Notification
                            {
                                UserId = seller.UserId,
                                NotificationType = nameof(NotificationType.ComplaintUpdate),
                                Message = $"Complaint for Order #{complaint.OrderId} is being actively resolved",
                                DetailedMessage = "The escalated complaint has been returned to support staff for resolution.",
                                RelatedEntityId = complaint.OrderId,
                                RelatedEntityType = "Order",
                                DateCreated = DateTime.UtcNow,
                                IsRead = false
                            };
                            _context.Notifications.Add(sellerNotification);
                        }
                    }
                }

                var admins = await _context.Admins.Include(a => a.User).ToListAsync();
                foreach (var admin in admins)
                {
                    if (admin.UserId != null)
                    {
                        var adminNotification = new Notification
                        {
                            UserId = admin.UserId,
                            NotificationType = nameof(NotificationType.SystemAlert),
                            Message = $"Complaint #{complaint.ComplaintId} de-escalated by {staff.FullName}",
                            DetailedMessage = dto.DeEscalationNotes,
                            RelatedEntityId = complaint.ComplaintId,
                            RelatedEntityType = "Complaint",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(adminNotification);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeEscalateComplaintAsync: {ex.Message}");
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ================== CUSTOMER ORDER HISTORY ==================

        public async Task<CustomerOrderHistoryDto?> GetCustomerOrderHistoryAsync(int supportStaffId, int customerId)
        {
            try
            {
                var customer = await _context.Customers
                    .Include(c => c.Orders)
                        .ThenInclude(o => o.OrderItems)
                    .FirstOrDefaultAsync(c => c.CustomerId == customerId);

                if (customer == null) return null;

                var complaintOrderIds = await _context.Complaints
                    .Where(c => c.CustomerId == customerId)
                    .Select(c => c.OrderId)
                    .ToListAsync();

                return new CustomerOrderHistoryDto
                {
                    CustomerId = customer.CustomerId,
                    CustomerName = customer.FullName ?? "Unknown",
                    TotalOrders = customer.TotalOrders,
                    TotalSpent = customer.TotalSpent,
                    Orders = customer.Orders?
                        .OrderByDescending(o => o.OrderDate)
                        .Select(o => new CustomerOrderSummaryDto
                        {
                            OrderId = o.OrderId,
                            OrderDate = o.OrderDate,
                            GrandTotal = o.GrandTotal,
                            OrderStatus = o.OrderStatus,
                            PaymentStatus = o.PaymentStatus,
                            HasComplaint = complaintOrderIds.Contains(o.OrderId),
                            TotalItems = o.OrderItems?.Sum(oi => oi.Quantity) ?? 0
                        }).ToList() ?? new List<CustomerOrderSummaryDto>()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCustomerOrderHistoryAsync: {ex.Message}");
                throw;
            }
        }

        // ================== STATISTICS ==================

        public async Task<SupportStaffStatsDto> GetMyStatisticsAsync(int supportStaffId)
        {
            try
            {
                var staff = await _context.SupportStaffs.FindAsync(supportStaffId);
                if (staff == null)
                    return new SupportStaffStatsDto();

                var today = DateTime.UtcNow.Date;

                var allComplaints = await _context.Complaints
                    .Where(c => c.AssignedSupportStaffId == supportStaffId)
                    .ToListAsync();

                var resolvedCount = allComplaints.Count(c =>
                    c.Status == nameof(ComplaintStatus.Resolved) ||
                    c.Status == nameof(ComplaintStatus.Closed));

                var escalatedCount = allComplaints.Count(c =>
                    c.Status == nameof(ComplaintStatus.Escalated));

                var todaysCount = allComplaints.Count(c =>
                    c.DateReported.Date == today);

                var resolutionRate = staff.TotalCasesHandled > 0
                    ? (decimal)resolvedCount / staff.TotalCasesHandled * 100
                    : 0;

                var complaintsByStatus = new ComplaintsByStatusDto
                {
                    Open = allComplaints.Count(c => c.Status == nameof(ComplaintStatus.Open)),
                    InProgress = allComplaints.Count(c => c.Status == nameof(ComplaintStatus.InProgress)),
                    Resolved = allComplaints.Count(c => c.Status == nameof(ComplaintStatus.Resolved)),
                    Closed = allComplaints.Count(c => c.Status == nameof(ComplaintStatus.Closed)),
                    Escalated = allComplaints.Count(c => c.Status == nameof(ComplaintStatus.Escalated))
                };

                var complaintsByPriority = new ComplaintsByPriorityDto
                {
                    Low = allComplaints.Count(c => c.Priority == "Low"),
                    Medium = allComplaints.Count(c => c.Priority == "Medium"),
                    High = allComplaints.Count(c => c.Priority == "High"),
                    Urgent = allComplaints.Count(c => c.Priority == "Urgent")
                };

                return new SupportStaffStatsDto
                {
                    TotalCasesHandled = staff.TotalCasesHandled,
                    ActiveCases = staff.ActiveCases,
                    ResolvedCases = resolvedCount,
                    EscalatedCases = escalatedCount,
                    TodaysCases = todaysCount,
                    ResolutionRate = Math.Round(resolutionRate, 2),
                    ComplaintsByStatus = complaintsByStatus,
                    ComplaintsByPriority = complaintsByPriority
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMyStatisticsAsync: {ex.Message}");
                throw;
            }
        }

        // ================== HELPER METHODS ==================

        private async Task<List<ComplaintConversationDto>> BuildComplaintConversationAsync(Complaint complaint)
        {
            var conversation = new List<ComplaintConversationDto>();

            try
            {
                // 1. System message - Complaint created
                conversation.Add(new ComplaintConversationDto
                {
                    MessageId = 0,
                    SenderType = "System",
                    SenderName = "System",
                    Message = "Complaint has been registered and is being reviewed by our team.",
                    Timestamp = complaint.DateReported,
                    IsInternal = false
                });

                // 2. Customer's complaint description
                conversation.Add(new ComplaintConversationDto
                {
                    MessageId = 1,
                    SenderType = "Customer",
                    SenderName = complaint.Customer?.FullName ?? "Unknown Customer",
                    Message = complaint.Description ?? "No description provided",
                    Timestamp = complaint.DateReported,
                    IsInternal = false
                });

                // 3. Auto-response
                var autoResponse = GetAutoResponseMessage(complaint.ComplaintType);
                if (!string.IsNullOrEmpty(autoResponse))
                {
                    conversation.Add(new ComplaintConversationDto
                    {
                        MessageId = 2,
                        SenderType = "System",
                        SenderName = "Support Bot",
                        Message = autoResponse,
                        Timestamp = complaint.DateReported.AddMinutes(1),
                        IsInternal = false
                    });
                }

                // 4. Load additional messages safely
                try
                {
                    var messages = await _context.Set<ComplaintMessage>()
                        .Where(m => m.ComplaintId == complaint.ComplaintId)
                        .OrderBy(m => m.Timestamp)
                        .ToListAsync();

                    int messageIdCounter = 3;
                    foreach (var msg in messages)
                    {
                        conversation.Add(new ComplaintConversationDto
                        {
                            MessageId = messageIdCounter++,
                            SenderType = msg.SenderType,
                            SenderName = msg.SenderName ?? "Unknown",
                            Message = msg.Message ?? "",
                            Timestamp = msg.Timestamp,
                            IsInternal = msg.IsInternal
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error loading complaint messages: {ex.Message}");
                    // Continue with system messages only
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error building conversation: {ex.Message}");
            }

            return conversation.OrderBy(c => c.Timestamp).ToList();
        }

        private string GetAutoResponseMessage(string complaintType)
        {
            return complaintType switch
            {
                nameof(ComplaintType.ProductQuality) =>
                    "Thank you for reporting this issue. Our team will review the product quality concern and contact you within 24 hours. Please keep the product and packaging for inspection if needed.",

                nameof(ComplaintType.PaymentDispute) =>
                    "We take payment disputes seriously. Our payment verification team has been notified and will investigate this matter. Your payment is currently on hold until this is resolved.",

                nameof(ComplaintType.DeliveryIssue) =>
                    "We apologize for the delivery inconvenience. Our logistics team has been notified and will contact you shortly to resolve this issue.",

                nameof(ComplaintType.SellerIssue) =>
                    "Thank you for bringing this to our attention. We will review the seller's conduct and take appropriate action. A support representative will contact you soon.",

                nameof(ComplaintType.RefundRequest) =>
                    "Your refund request has been received. Please allow our team to review the order details. We will process your request within 3-5 business days.",

                _ =>
                    "Thank you for contacting support. A support representative will review your complaint and respond within 24 hours."
            };
        }

        private void AddSystemMessage(int complaintId, string message)
        {
            try
            {
                var systemMessage = new ComplaintMessage
                {
                    ComplaintId = complaintId,
                    SenderType = "System",
                    SenderName = "System",
                    Message = message,
                    Timestamp = DateTime.UtcNow,
                    IsInternal = false
                };

                _context.Set<ComplaintMessage>().Add(systemMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding system message: {ex.Message}");
                // Don't throw - system messages are not critical
            }
        }
    }
}