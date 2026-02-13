using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Helpers;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Seller;
using MarketPlace.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class SellerService : ISellerService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IOwnershipHelper _ownershipHelper;
        private readonly IRatingCalculator _ratingCalculator;

        public SellerService(
            ApplicationDbContext context,
            ICloudinaryService cloudinaryService,
            IOwnershipHelper ownershipHelper,
            IRatingCalculator ratingCalculator)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _ownershipHelper = ownershipHelper;
            _ratingCalculator = ratingCalculator;
        }

        public async Task<ApiResponse<ProductResponseDto>> CreateProductAsync(int sellerId, CreateProductDto dto)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null || !seller.IsActive)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Seller not found or inactive");

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null || !category.IsActive)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Invalid or inactive category");

            var product = new Product
            {
                SellerId = sellerId,
                ProductName = dto.ProductName,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                StockQuantity = dto.StockQuantity,
                LowStockThreshold = dto.LowStockThreshold,
                DateListed = DateTime.UtcNow,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var response = await MapToProductResponseDto(product);
            return ApiResponse<ProductResponseDto>.SuccessResponse(response, "Product created successfully");
        }

        public async Task<ApiResponse<ProductResponseDto>> UpdateProductAsync(int sellerId, int productId, UpdateProductDto dto)
        {
            var product = await _context.Products.Include(p => p.Seller).FirstOrDefaultAsync(p => p.ProductId == productId);
            if (product == null)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Product not found");
            if (product.SellerId != sellerId)
                return ApiResponse<ProductResponseDto>.ErrorResponse("You don't have permission to update this product");

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null || !category.IsActive)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Invalid or inactive category");

            product.ProductName = dto.ProductName;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.CategoryId = dto.CategoryId;
            product.StockQuantity = dto.StockQuantity;
            product.LowStockThreshold = dto.LowStockThreshold;
            product.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            var response = await MapToProductResponseDto(product);
            return ApiResponse<ProductResponseDto>.SuccessResponse(response, "Product updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteProductAsync(int sellerId, int productId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Product not found");
            if (product.SellerId != sellerId)
                return ApiResponse<bool>.ErrorResponse("You don't have permission to delete this product");

            var hasPendingOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == productId &&
                (oi.Order.OrderStatus == nameof(OrderStatus.Pending) || oi.Order.OrderStatus == nameof(OrderStatus.Confirmed) ||
                 oi.Order.OrderStatus == nameof(OrderStatus.PickedUp) || oi.Order.OrderStatus == nameof(OrderStatus.OnTheWay)));

            if (hasPendingOrders)
                return ApiResponse<bool>.ErrorResponse("Cannot delete product with pending orders. Please deactivate it instead.");

            if (!string.IsNullOrEmpty(product.ProductImage))
            {
                var publicId = _cloudinaryService.GetPublicIdFromUrl(product.ProductImage);
                if (!string.IsNullOrEmpty(publicId))
                    await _cloudinaryService.DeleteImageAsync(publicId);
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.SuccessResponse(true, "Product deleted successfully");
        }

        public async Task<ApiResponse<ProductResponseDto>> UpdateProductStockAsync(int sellerId, int productId, UpdateProductStockDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Category)  // Add this line to load Category
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Product not found");

            if (product.SellerId != sellerId)
                return ApiResponse<ProductResponseDto>.ErrorResponse("You don't have permission to update this product");

            product.StockQuantity = dto.StockQuantity;
            product.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            var response = await MapToProductResponseDto(product);
            return ApiResponse<ProductResponseDto>.SuccessResponse(response, "Product stock updated successfully");
        }

        public async Task<ApiResponse<ProductResponseDto>> GetProductByIdAsync(int sellerId, int productId)
        {
            var product = await _context.Products
             .Include(p => p.Category)
             .FirstOrDefaultAsync(p => p.ProductId == productId && p.SellerId == sellerId);

            if (product == null)
                return ApiResponse<ProductResponseDto>.ErrorResponse("Product not found");

            var response = await MapToProductResponseDto(product);
            return ApiResponse<ProductResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<PagedResult<ProductResponseDto>>> GetMyProductsAsync(int sellerId, ProductFilterParams filterParams)
        {
            var query = _context.Products.Include(p => p.Seller).Include(p => p.Category)
                .Where(p => p.SellerId == sellerId).AsQueryable();

            if (!string.IsNullOrEmpty(filterParams.SearchTerm))
                query = query.Where(p => p.ProductName.Contains(filterParams.SearchTerm) ||
                    (p.Description != null && p.Description.Contains(filterParams.SearchTerm)));

            if (!string.IsNullOrEmpty(filterParams.Category))
                query = query.Where(p => p.Category.CategoryName == filterParams.Category);

            if (filterParams.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filterParams.MinPrice.Value);

            if (filterParams.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filterParams.MaxPrice.Value);

            if (filterParams.InStock.HasValue)
                query = filterParams.InStock.Value ? query.Where(p => p.StockQuantity > 0) : query.Where(p => p.StockQuantity == 0);

            if (filterParams.IsActive.HasValue)
                query = query.Where(p => p.IsActive == filterParams.IsActive.Value);

            query = query.ApplySorting(filterParams.SortBy ?? "DateListed", filterParams.SortOrder);
            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = new List<ProductResponseDto>();
            foreach (var product in pagedResult.Items)
                mappedItems.Add(await MapToProductResponseDto(product));

            return ApiResponse<PagedResult<ProductResponseDto>>.SuccessResponse(new PagedResult<ProductResponseDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<string>> UploadProductImageAsync(int sellerId, int productId, IFormFile image)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId && p.SellerId == sellerId);
            if (product == null)
                return ApiResponse<string>.ErrorResponse("Product not found or you don't have permission");

            if (!string.IsNullOrEmpty(product.ProductImage))
            {
                var oldPublicId = _cloudinaryService.GetPublicIdFromUrl(product.ProductImage);
                if (!string.IsNullOrEmpty(oldPublicId))
                    await _cloudinaryService.DeleteImageAsync(oldPublicId);
            }

            var imageUrl = await _cloudinaryService.UploadImageAsync(image, "products");
            if (string.IsNullOrEmpty(imageUrl))
                return ApiResponse<string>.ErrorResponse("Failed to upload image. Please check file format and size (max 5MB).");

            product.ProductImage = imageUrl;
            await _context.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(imageUrl, "Image uploaded successfully");
        }

        public async Task<ApiResponse<bool>> DeleteProductImageAsync(int sellerId, int productId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId && p.SellerId == sellerId);
            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Product not found or you don't have permission");
            if (string.IsNullOrEmpty(product.ProductImage))
                return ApiResponse<bool>.ErrorResponse("Product has no image");

            var publicId = _cloudinaryService.GetPublicIdFromUrl(product.ProductImage);
            if (!string.IsNullOrEmpty(publicId))
                await _cloudinaryService.DeleteImageAsync(publicId);

            product.ProductImage = null;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.SuccessResponse(true, "Image deleted successfully");
        }

        public async Task<ApiResponse<PagedResult<SellerOrderResponseDto>>> GetMyOrdersAsync(int sellerId, OrderFilterParams filterParams)
        {
            var query = _context.Orders
                .Include(o => o.Customer).ThenInclude(c => c.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Seller)
                .Where(o => o.OrderItems.Any(oi => oi.SellerId == sellerId)).AsQueryable();

            if (!string.IsNullOrEmpty(filterParams.OrderStatus))
                query = query.Where(o => o.OrderStatus == filterParams.OrderStatus);
            if (!string.IsNullOrEmpty(filterParams.PaymentStatus))
                query = query.Where(o => o.PaymentStatus == filterParams.PaymentStatus);
            if (filterParams.FromDate.HasValue)
                query = query.Where(o => o.OrderDate >= filterParams.FromDate.Value);
            if (filterParams.ToDate.HasValue)
                query = query.Where(o => o.OrderDate <= filterParams.ToDate.Value);

            query = query.ApplySorting(filterParams.SortBy ?? "OrderDate", filterParams.SortOrder);
            var pagedResult = await query.ToPagedResultAsync(filterParams);

            return ApiResponse<PagedResult<SellerOrderResponseDto>>.SuccessResponse(new PagedResult<SellerOrderResponseDto>
            {
                Items = pagedResult.Items.Select(order => MapToSellerOrderResponseDto(order, sellerId)).ToList(),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<SellerOrderResponseDto>> GetOrderDetailsAsync(int sellerId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer).ThenInclude(c => c.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Seller)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.OrderItems.Any(oi => oi.SellerId == sellerId));

            if (order == null)
                return ApiResponse<SellerOrderResponseDto>.ErrorResponse("Order not found or you don't have access");

            return ApiResponse<SellerOrderResponseDto>.SuccessResponse(MapToSellerOrderResponseDto(order, sellerId));
        }

        // 🔧 MAJOR FIX: Proper Multi-Vendor Order Confirmation
        public async Task<ApiResponse<bool>> ConfirmOrderAsync(int sellerId, int orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Include(o => o.Customer)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                    return ApiResponse<bool>.ErrorResponse("Order not found");

                // Check if seller has items in this order
                var sellerItems = order.OrderItems.Where(oi => oi.SellerId == sellerId).ToList();
                if (!sellerItems.Any())
                    return ApiResponse<bool>.ErrorResponse("You have no items in this order");

                // Check if order is in pending status
                if (order.OrderStatus != nameof(OrderStatus.Pending))
                    return ApiResponse<bool>.ErrorResponse($"Order cannot be confirmed. Current status: {order.OrderStatus}");

                // Get all unique sellers in this order
                var allSellers = order.OrderItems.Select(oi => oi.SellerId).Distinct().ToList();

                // Track seller confirmations (you might want to add a SellerOrderConfirmation table)
                // For now, we'll check if ALL sellers have confirmed by checking a flag
                // This is a simplified approach - ideally you'd have a separate confirmation tracking table

                // Check if this seller already confirmed
                var existingConfirmation = await _context.Set<SellerOrderConfirmation>()
                    .FirstOrDefaultAsync(sc => sc.OrderId == orderId && sc.SellerId == sellerId);

                if (existingConfirmation != null)
                    return ApiResponse<bool>.ErrorResponse("You have already confirmed this order");

                // Add seller confirmation record
                var confirmation = new SellerOrderConfirmation
                {
                    OrderId = orderId,
                    SellerId = sellerId,
                    ConfirmedAt = DateTime.UtcNow
                };
                _context.Set<SellerOrderConfirmation>().Add(confirmation);

                // Check if all sellers have confirmed
                var confirmedSellers = await _context.Set<SellerOrderConfirmation>()
                    .Where(sc => sc.OrderId == orderId)
                    .Select(sc => sc.SellerId)
                    .ToListAsync();

                confirmedSellers.Add(sellerId); // Add current seller

                bool allSellersConfirmed = allSellers.All(s => confirmedSellers.Contains(s));

                // Only update order status if ALL sellers confirmed
                if (allSellersConfirmed)
                {
                    order.OrderStatus = nameof(OrderStatus.Confirmed);

                    // Notify customer that order is fully confirmed
                    var notification = new Notification
                    {
                        UserId = order.Customer.UserId,
                        NotificationType = nameof(NotificationType.OrderConfirmed),
                        Message = $"Order #{orderId} has been confirmed by all sellers",
                        RelatedEntityId = orderId,
                        RelatedEntityType = "Order",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }
                else
                {
                    // Partial confirmation - notify customer
                    var notification = new Notification
                    {
                        UserId = order.Customer.UserId,
                        NotificationType = nameof(NotificationType.OrderConfirmed),
                        Message = $"Order #{orderId} - Seller '{await GetSellerShopName(sellerId)}' has confirmed their items",
                        RelatedEntityId = orderId,
                        RelatedEntityType = "Order",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var message = allSellersConfirmed
                    ? "Order confirmed successfully. All sellers have confirmed."
                    : "Your items confirmed successfully. Waiting for other sellers to confirm.";

                return ApiResponse<bool>.SuccessResponse(true, message);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<bool>.ErrorResponse($"Failed to confirm order: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PagedResult<PaymentVerificationResponseDto>>> GetMyPaymentVerificationsAsync(int sellerId, PaginationParams paginationParams)
        {
            var query = _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer).ThenInclude(c => c.User)
                .Where(pv => pv.SellerId == sellerId).AsQueryable();

            query = query.ApplySorting(paginationParams.SortBy ?? "VerificationStartDate", paginationParams.SortOrder);
            var pagedResult = await query.ToPagedResultAsync(paginationParams);

            return ApiResponse<PagedResult<PaymentVerificationResponseDto>>.SuccessResponse(new PagedResult<PaymentVerificationResponseDto>
            {
                Items = pagedResult.Items.Select(MapToPaymentVerificationResponseDto).ToList(),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<PaymentVerificationResponseDto>> GetPaymentVerificationDetailsAsync(int sellerId, int verificationId)
        {
            var verification = await _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(pv => pv.VerificationId == verificationId && pv.SellerId == sellerId);

            if (verification == null)
                return ApiResponse<PaymentVerificationResponseDto>.ErrorResponse("Payment verification not found");

            return ApiResponse<PaymentVerificationResponseDto>.SuccessResponse(MapToPaymentVerificationResponseDto(verification));
        }

        public async Task<ApiResponse<PagedResult<SellerFollowerResponseDto>>> GetMyFollowersAsync(int sellerId, PaginationParams paginationParams)
        {
            var query = _context.SellerFollowers
                .Include(sf => sf.Customer).ThenInclude(c => c.User)
                .Where(sf => sf.SellerId == sellerId).AsQueryable();

            query = query.ApplySorting(paginationParams.SortBy ?? "DateFollowed", paginationParams.SortOrder);
            var pagedResult = await query.ToPagedResultAsync(paginationParams);

            return ApiResponse<PagedResult<SellerFollowerResponseDto>>.SuccessResponse(new PagedResult<SellerFollowerResponseDto>
            {
                Items = pagedResult.Items.Select(sf => new SellerFollowerResponseDto
                {
                    FollowerId = sf.FollowerId,
                    CustomerId = sf.CustomerId,
                    CustomerName = sf.Customer.FullName,
                    CustomerEmail = sf.Customer.User.Email,
                    DateFollowed = sf.DateFollowed,
                    NotificationsEnabled = sf.NotificationsEnabled,
                    TotalOrders = sf.Customer.TotalOrders,
                    TotalSpent = sf.Customer.TotalSpent
                }).ToList(),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<SellerProfileDto>> GetMyProfileAsync(int sellerId)
        {
            var seller = await _context.Sellers
                .Include(s => s.User).Include(s => s.Products).Include(s => s.Followers)
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (seller == null)
                return ApiResponse<SellerProfileDto>.ErrorResponse("Seller not found");

            var pendingPayments = await _context.PaymentVerifications
                .CountAsync(pv => pv.SellerId == sellerId &&
                    (pv.Status == nameof(PaymentStatus.Pending) || pv.Status == nameof(PaymentStatus.VerificationPeriod)));

            return ApiResponse<SellerProfileDto>.SuccessResponse(new SellerProfileDto
            {
                SellerId = seller.SellerId,
                UserId = seller.UserId,
                UserName = seller.User.UserName!,
                Email = seller.User.Email!,
                ShopName = seller.ShopName,
                ShopDescription = seller.ShopDescription,
                ShopLogo = seller.ShopLogo,
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
                TotalFollowers = seller.Followers.Count,
                PendingPayments = pendingPayments
            });
        }

        public async Task<ApiResponse<SellerDashboardStatsDto>> GetDashboardStatsAsync(int sellerId)
        {
            var seller = await _context.Sellers.Include(s => s.Products).FirstOrDefaultAsync(s => s.SellerId == sellerId);
            if (seller == null)
                return ApiResponse<SellerDashboardStatsDto>.ErrorResponse("Seller not found");

            var stats = new SellerDashboardStatsDto
            {
                TotalProducts = seller.Products.Count,
                ActiveProducts = seller.Products.Count(p => p.IsActive),
                LowStockProducts = seller.Products.Count(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive),
                TotalOrders = seller.TotalOrders,
                TotalRevenue = seller.TotalSales,
                OverallRating = seller.OverallRating,
                TotalReviews = seller.TotalReviews,
                TotalFollowers = await _context.SellerFollowers.CountAsync(sf => sf.SellerId == sellerId)
            };

            var orderItems = await _context.OrderItems.Include(oi => oi.Order).Where(oi => oi.SellerId == sellerId).ToListAsync();
            stats.PendingOrders = orderItems.Count(oi => oi.Order.OrderStatus == nameof(OrderStatus.Pending) ||
                oi.Order.OrderStatus == nameof(OrderStatus.Confirmed) || oi.Order.OrderStatus == nameof(OrderStatus.PickedUp) ||
                oi.Order.OrderStatus == nameof(OrderStatus.OnTheWay));
            stats.CompletedOrders = orderItems.Count(oi => oi.Order.OrderStatus == nameof(OrderStatus.Completed));

            var paymentVerifications = await _context.PaymentVerifications.Where(pv => pv.SellerId == sellerId).ToListAsync();
            stats.PendingPayments = paymentVerifications.Where(pv => pv.Status == nameof(PaymentStatus.Pending) ||
                pv.Status == nameof(PaymentStatus.VerificationPeriod)).Sum(pv => pv.Amount);
            stats.ReleasedPayments = paymentVerifications.Where(pv => pv.Status == nameof(PaymentStatus.Released) ||
                pv.Status == nameof(PaymentStatus.AutoReleased) || pv.Status == nameof(PaymentStatus.ManuallyReleased)).Sum(pv => pv.Amount);

            // 🔧 FIX: Include Category when loading recent products
            var recentProducts = await _context.Products
                .Include(p => p.Category)  // ← Added this line
                .Where(p => p.SellerId == sellerId)
                .OrderByDescending(p => p.DateListed)
                .Take(5)
                .ToListAsync();

            foreach (var product in recentProducts)
                stats.RecentProducts.Add(await MapToProductResponseDto(product));

            var recentOrders = await _context.Orders
                .Include(o => o.Customer).ThenInclude(c => c.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Seller)
                .Where(o => o.OrderItems.Any(oi => oi.SellerId == sellerId))
                .OrderByDescending(o => o.OrderDate).Take(5).ToListAsync();
            stats.RecentOrders = recentOrders.Select(o => MapToSellerOrderResponseDto(o, sellerId)).ToList();

            var pendingVerifications = await _context.PaymentVerifications
                .Include(pv => pv.Order).ThenInclude(o => o.Customer).ThenInclude(c => c.User)
                .Where(pv => pv.SellerId == sellerId &&
                    (pv.Status == nameof(PaymentStatus.Pending) || pv.Status == nameof(PaymentStatus.VerificationPeriod)))
                .OrderByDescending(pv => pv.VerificationStartDate).Take(5).ToListAsync();
            stats.PendingVerifications = pendingVerifications.Select(MapToPaymentVerificationResponseDto).ToList();

            return ApiResponse<SellerDashboardStatsDto>.SuccessResponse(stats);
        }

        public async Task<ApiResponse<List<CategoryListDto>>> GetActiveCategoriesAsync()
        {
            var categories = await _context.Categories.Where(c => c.IsActive).OrderBy(c => c.CategoryName)
                .Select(c => new CategoryListDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.CategoryName : null,
                    IsActive = c.IsActive
                }).ToListAsync();

            return ApiResponse<List<CategoryListDto>>.SuccessResponse(categories);
        }

        private async Task<ProductResponseDto> MapToProductResponseDto(Product product)
        {
            if (product.Category == null)
                throw new InvalidOperationException("Category must be loaded before mapping ProductResponseDto");

            var reviews = await _context.Reviews.Where(r => r.ProductId == product.ProductId && r.IsApproved).ToListAsync();
            var totalSales = await _context.OrderItems
                .Where(oi => oi.ProductId == product.ProductId && oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                .SumAsync(oi => oi.Quantity);

            return new ProductResponseDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.CategoryName,
                StockQuantity = product.StockQuantity,
                LowStockThreshold = product.LowStockThreshold,
                ProductImage = product.ProductImage,
                IsActive = product.IsActive,
                DateListed = product.DateListed,
                IsLowStock = product.StockQuantity <= product.LowStockThreshold,
                TotalReviews = reviews.Count,
                AverageRating = reviews.Any() ? (decimal)reviews.Average(r => r.Rating) : 0,
                TotalSales = totalSales
            };
        }

        private SellerOrderResponseDto MapToSellerOrderResponseDto(Order order, int sellerId)
        {
            var myItems = order.OrderItems.Where(oi => oi.SellerId == sellerId).ToList();
            var allItems = order.OrderItems.Select(oi => new OrderItemInOrderDto
            {
                OrderItemId = oi.OrderItemId,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductImage = oi.ProductImage,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                Subtotal = oi.Subtotal,
                SellerId = oi.SellerId,
                SellerShopName = oi.Seller.ShopName,
                IsMyProduct = oi.SellerId == sellerId
            }).ToList();

            return new SellerOrderResponseDto
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.PaymentStatus,
                GrandTotal = order.GrandTotal,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.FullName,
                CustomerPhone = order.CustomerPhone ?? order.Customer.Phone ?? "N/A",
                DeliveryAddress = order.DeliveryAddress,
                DeliveryCity = order.DeliveryCity,
                DeliveryPostalCode = order.DeliveryPostalCode,
                DeliveryDate = order.DeliveryDate,
                VerificationPeriodEnd = order.VerificationPeriodEnd,
                CustomerConfirmedReceipt = order.CustomerConfirmedReceipt,
                CustomerReportedProblem = order.CustomerReportedProblem,
                AllOrderItems = allItems,
                MyOrderItems = allItems.Where(oi => oi.IsMyProduct).ToList(),
                MyItemsSubtotal = myItems.Sum(oi => oi.Subtotal),
                MyItemsCount = myItems.Count
            };
        }

        private PaymentVerificationResponseDto MapToPaymentVerificationResponseDto(PaymentVerification verification)
        {
            var daysRemaining = (verification.VerificationEndDate - DateTime.UtcNow).Days;
            return new PaymentVerificationResponseDto
            {
                VerificationId = verification.VerificationId,
                OrderId = verification.OrderId,
                Amount = verification.Amount,
                VerificationStartDate = verification.VerificationStartDate,
                VerificationEndDate = verification.VerificationEndDate,
                Status = verification.Status,
                CustomerAction = verification.CustomerAction,
                ActionDate = verification.ActionDate,
                ReleasedDate = verification.ReleasedDate,
                DaysRemaining = daysRemaining > 0 ? daysRemaining : 0,
                IsExpired = DateTime.UtcNow > verification.VerificationEndDate,
                OrderStatus = verification.Order.OrderStatus,
                CustomerName = verification.Order.Customer.FullName
            };
        }

        // ============================================
        // SHOP LOGO MANAGEMENT
        // ============================================

        public async Task<ApiResponse<string>> UploadShopLogoAsync(int sellerId, IFormFile logo)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null || !seller.IsActive)
                return ApiResponse<string>.ErrorResponse("Seller not found or inactive");

            // Delete old logo if exists
            if (!string.IsNullOrEmpty(seller.ShopLogo))
            {
                var oldPublicId = _cloudinaryService.GetPublicIdFromUrl(seller.ShopLogo);
                if (!string.IsNullOrEmpty(oldPublicId))
                    await _cloudinaryService.DeleteImageAsync(oldPublicId);
            }

            // Upload new logo
            var logoUrl = await _cloudinaryService.UploadImageAsync(logo, "shop-logos");
            if (string.IsNullOrEmpty(logoUrl))
                return ApiResponse<string>.ErrorResponse("Failed to upload logo. Please check file format and size (max 5MB).");

            seller.ShopLogo = logoUrl;
            await _context.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(logoUrl, "Shop logo uploaded successfully");
        }

        public async Task<ApiResponse<bool>> DeleteShopLogoAsync(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null || !seller.IsActive)
                return ApiResponse<bool>.ErrorResponse("Seller not found or inactive");

            if (string.IsNullOrEmpty(seller.ShopLogo))
                return ApiResponse<bool>.ErrorResponse("Shop has no logo");

            var publicId = _cloudinaryService.GetPublicIdFromUrl(seller.ShopLogo);
            if (!string.IsNullOrEmpty(publicId))
                await _cloudinaryService.DeleteImageAsync(publicId);

            seller.ShopLogo = null;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Shop logo deleted successfully");
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private async Task<string> GetSellerShopName(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            return seller?.ShopName ?? "Unknown Seller";
        }
    }
}