using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.InventoryManager;
using MarketPlace.Models.DTOs.Seller;
using MarketPlace.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class InventoryManagerService : IInventoryManagerService
    {
        private readonly ApplicationDbContext _context;

        public InventoryManagerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<InventoryManagerProfileDto>> GetMyProfileAsync(int inventoryManagerId)
        {
            var manager = await _context.InventoryManagers
                .Include(im => im.User)
                .FirstOrDefaultAsync(im => im.InventoryManagerId == inventoryManagerId);

            if (manager == null)
                return ApiResponse<InventoryManagerProfileDto>.ErrorResponse("Inventory Manager not found");

            var profile = new InventoryManagerProfileDto
            {
                InventoryManagerId = manager.InventoryManagerId,
                UserId = manager.UserId,
                UserName = manager.User.UserName!,
                Email = manager.User.Email!,
                FullName = manager.FullName,
                EmployeeCode = manager.EmployeeCode,
                Department = manager.Department,
                Phone = manager.Phone,
                DateJoined = manager.DateJoined,
                IsActive = manager.IsActive,
                AssignedWarehouse = manager.AssignedWarehouse
            };

            return ApiResponse<InventoryManagerProfileDto>.SuccessResponse(profile);
        }

        public async Task<ApiResponse<PagedResult<ProductInventoryDto>>> GetAllProductsAsync(InventoryFilterParams filterParams)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filterParams.SearchTerm))
            {
                query = query.Where(p => p.ProductName.Contains(filterParams.SearchTerm) ||
                    (p.Description != null && p.Description.Contains(filterParams.SearchTerm)));
            }

            if (filterParams.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == filterParams.CategoryId.Value);

            if (filterParams.SellerId.HasValue)
                query = query.Where(p => p.SellerId == filterParams.SellerId.Value);

            if (filterParams.IsLowStock.HasValue && filterParams.IsLowStock.Value)
                query = query.Where(p => p.StockQuantity <= p.LowStockThreshold);

            if (filterParams.IsOutOfStock.HasValue && filterParams.IsOutOfStock.Value)
                query = query.Where(p => p.StockQuantity == 0);

            if (filterParams.IsActive.HasValue)
                query = query.Where(p => p.IsActive == filterParams.IsActive.Value);

            if (filterParams.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filterParams.MinPrice.Value);

            if (filterParams.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filterParams.MaxPrice.Value);

            query = query.ApplySorting(filterParams.SortBy ?? "ProductName", filterParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(filterParams);

            var mappedItems = new List<ProductInventoryDto>();
            foreach (var product in pagedResult.Items)
            {
                mappedItems.Add(await MapToProductInventoryDtoAsync(product));
            }

            return ApiResponse<PagedResult<ProductInventoryDto>>.SuccessResponse(new PagedResult<ProductInventoryDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<ProductInventoryDto>> GetProductInventoryDetailsAsync(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
                return ApiResponse<ProductInventoryDto>.ErrorResponse("Product not found");

            var inventoryDto = await MapToProductInventoryDtoAsync(product);
            return ApiResponse<ProductInventoryDto>.SuccessResponse(inventoryDto);
        }

        // 🔧 ENHANCED: Better stock update with validation and notifications
        public async Task<ApiResponse<StockUpdateResponseDto>> UpdateProductStockAsync(
     int productId, UpdateStockDto dto, int? inventoryManagerId = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products
                    .Include(p => p.Seller)
                        .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(p => p.ProductId == productId);

                if (product == null)
                    return ApiResponse<StockUpdateResponseDto>.ErrorResponse("Product not found");

                if (dto.StockQuantity < 0)
                    return ApiResponse<StockUpdateResponseDto>.ErrorResponse("Stock quantity cannot be negative");

                var oldStock = product.StockQuantity;
                var wasLowStock = oldStock <= product.LowStockThreshold;

                product.StockQuantity = dto.StockQuantity;

                // Record stock adjustment
                await RecordStockAdjustmentAsync(
                    productId: productId,
                    oldStock: oldStock,
                    newStock: dto.StockQuantity,
                    adjustmentType: nameof(AdjustmentType.ManualUpdate),
                    reason: dto.Notes,
                    notes: dto.Notes,
                    inventoryManagerId: inventoryManagerId,
                    isAutomated: false
                );

                var isNowLowStock = product.StockQuantity <= product.LowStockThreshold;
                var isNowOutOfStock = product.StockQuantity == 0;

                if (isNowLowStock && !wasLowStock)
                {
                    await CreateLowStockNotificationAsync(product);
                }

                if (isNowOutOfStock && oldStock > 0)
                {
                    await CreateOutOfStockNotificationAsync(product);
                }

                if (!isNowLowStock && wasLowStock && product.StockQuantity > product.LowStockThreshold)
                {
                    await CreateStockRestoredNotificationAsync(product);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = new StockUpdateResponseDto
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    OldStockQuantity = oldStock,
                    NewStockQuantity = product.StockQuantity,
                    UpdatedAt = DateTime.UtcNow,
                    Notes = dto.Notes
                };

                return ApiResponse<StockUpdateResponseDto>.SuccessResponse(response, "Stock updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<StockUpdateResponseDto>.ErrorResponse($"Failed to update stock: {ex.Message}");
            }
        }

        // 🔧 ENHANCED: Better bulk update with validation and error handling
        public async Task<ApiResponse<List<StockUpdateResponseDto>>> BulkUpdateStockAsync(
     BulkStockUpdateDto dto, int? inventoryManagerId = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var responses = new List<StockUpdateResponseDto>();
                var errors = new List<string>();

                foreach (var item in dto.Items)
                {
                    if (item.StockQuantity < 0)
                    {
                        errors.Add($"Product ID {item.ProductId}: Stock quantity cannot be negative");
                    }
                }

                if (errors.Any())
                {
                    return ApiResponse<List<StockUpdateResponseDto>>.ErrorResponse(
                        "Validation failed", errors);
                }

                var productIds = dto.Items.Select(i => i.ProductId).ToList();
                var products = await _context.Products
                    .Include(p => p.Seller)
                        .ThenInclude(s => s.User)
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToListAsync();

                foreach (var item in dto.Items)
                {
                    var product = products.FirstOrDefault(p => p.ProductId == item.ProductId);

                    if (product == null)
                    {
                        errors.Add($"Product ID {item.ProductId} not found");
                        continue;
                    }

                    var oldStock = product.StockQuantity;
                    var wasLowStock = oldStock <= product.LowStockThreshold;

                    product.StockQuantity = item.StockQuantity;

                    // Record bulk adjustment
                    await RecordStockAdjustmentAsync(
                        productId: item.ProductId,
                        oldStock: oldStock,
                        newStock: item.StockQuantity,
                        adjustmentType: nameof(AdjustmentType.BulkUpdate),
                        reason: "Bulk stock update",
                        notes: null,
                        inventoryManagerId: inventoryManagerId,
                        isAutomated: false
                    );

                    var isNowLowStock = product.StockQuantity <= product.LowStockThreshold;
                    var isNowOutOfStock = product.StockQuantity == 0;

                    if (isNowLowStock && !wasLowStock)
                    {
                        await CreateLowStockNotificationAsync(product);
                    }

                    if (isNowOutOfStock && oldStock > 0)
                    {
                        await CreateOutOfStockNotificationAsync(product);
                    }

                    if (!isNowLowStock && wasLowStock && product.StockQuantity > product.LowStockThreshold)
                    {
                        await CreateStockRestoredNotificationAsync(product);
                    }

                    responses.Add(new StockUpdateResponseDto
                    {
                        ProductId = product.ProductId,
                        ProductName = product.ProductName,
                        OldStockQuantity = oldStock,
                        NewStockQuantity = product.StockQuantity,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                if (errors.Any())
                {
                    return ApiResponse<List<StockUpdateResponseDto>>.ErrorResponse(
                        $"Bulk update completed with {errors.Count} errors", errors);
                }

                return ApiResponse<List<StockUpdateResponseDto>>.SuccessResponse(
                    responses, $"Successfully updated {responses.Count} products");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<List<StockUpdateResponseDto>>.ErrorResponse(
                    $"Bulk update failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PagedResult<LowStockAlertDto>>> GetLowStockAlertsAsync(PaginationParams paginationParams)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .Where(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive)
                .AsQueryable();

            query = query.ApplySorting(paginationParams.SortBy ?? "StockQuantity", paginationParams.SortOrder);

            var pagedResult = await query.ToPagedResultAsync(paginationParams);

            var mappedItems = pagedResult.Items.Select(MapToLowStockAlertDto).ToList();

            return ApiResponse<PagedResult<LowStockAlertDto>>.SuccessResponse(new PagedResult<LowStockAlertDto>
            {
                Items = mappedItems,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            });
        }

        public async Task<ApiResponse<List<LowStockAlertDto>>> GetCriticalLowStockAlertsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .Where(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive)
                .OrderBy(p => p.StockQuantity)
                .Take(20)
                .ToListAsync();

            var alerts = products.Select(MapToLowStockAlertDto).ToList();

            return ApiResponse<List<LowStockAlertDto>>.SuccessResponse(alerts);
        }

        public async Task<ApiResponse<InventoryDashboardDto>> GetDashboardStatsAsync()
        {
            var allProducts = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .ToListAsync();

            var dashboard = new InventoryDashboardDto
            {
                TotalProducts = allProducts.Count,
                ActiveProducts = allProducts.Count(p => p.IsActive),
                InactiveProducts = allProducts.Count(p => !p.IsActive),
                LowStockProducts = allProducts.Count(p => p.StockQuantity <= p.LowStockThreshold && p.StockQuantity > 0 && p.IsActive),
                OutOfStockProducts = allProducts.Count(p => p.StockQuantity == 0 && p.IsActive),
                TotalCategories = await _context.Categories.CountAsync(c => c.IsActive),
                TotalSellers = await _context.Sellers.CountAsync(s => s.IsActive),
                TotalInventoryValue = allProducts.Where(p => p.IsActive).Sum(p => p.Price * p.StockQuantity)
            };

            // Critical Low Stock Alerts (top 10)
            var criticalProducts = allProducts
                .Where(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive)
                .OrderBy(p => p.StockQuantity)
                .Take(10)
                .ToList();

            dashboard.CriticalLowStockAlerts = criticalProducts.Select(MapToLowStockAlertDto).ToList();

            // Recently Updated Products
            var recentProducts = allProducts
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.DateListed)
                .Take(5)
                .ToList();

            foreach (var product in recentProducts)
            {
                dashboard.RecentlyUpdatedProducts.Add(await MapToProductInventoryDtoAsync(product));
            }

            // Category Stock Summary
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .ToListAsync();

            foreach (var category in categories)
            {
                var categoryProducts = allProducts.Where(p => p.CategoryId == category.CategoryId && p.IsActive).ToList();

                if (categoryProducts.Any())
                {
                    dashboard.CategoryStockSummary.Add(new CategoryStockSummaryDto
                    {
                        CategoryId = category.CategoryId,
                        CategoryName = category.CategoryName,
                        TotalProducts = categoryProducts.Count,
                        LowStockProducts = categoryProducts.Count(p => p.StockQuantity <= p.LowStockThreshold && p.StockQuantity > 0),
                        OutOfStockProducts = categoryProducts.Count(p => p.StockQuantity == 0),
                        TotalValue = categoryProducts.Sum(p => p.Price * p.StockQuantity)
                    });
                }
            }

            return ApiResponse<InventoryDashboardDto>.SuccessResponse(dashboard);
        }

        public async Task<ApiResponse<List<CategoryListDto>>> GetActiveCategoriesAsync()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.CategoryName)
                .Select(c => new CategoryListDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.CategoryName : null,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return ApiResponse<List<CategoryListDto>>.SuccessResponse(categories);
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private async Task<ProductInventoryDto> MapToProductInventoryDtoAsync(Product product)
        {
            var totalSales = await _context.OrderItems
                .Where(oi => oi.ProductId == product.ProductId &&
                    oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                .SumAsync(oi => oi.Quantity);

            var totalRevenue = await _context.OrderItems
                .Where(oi => oi.ProductId == product.ProductId &&
                    oi.Order.OrderStatus == nameof(OrderStatus.Completed))
                .SumAsync(oi => oi.Subtotal);

            return new ProductInventoryDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductImage = product.ProductImage,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.CategoryName,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                LowStockThreshold = product.LowStockThreshold,
                IsLowStock = product.StockQuantity <= product.LowStockThreshold,
                IsActive = product.IsActive,
                DateListed = product.DateListed,
                SellerId = product.SellerId,
                SellerShopName = product.Seller.ShopName,
                SellerContactPhone = product.Seller.ContactPhone,
                SellerEmail = product.Seller.ContactEmail,
                TotalSales = totalSales,
                TotalRevenue = totalRevenue
            };
        }

        private LowStockAlertDto MapToLowStockAlertDto(Product product)
        {
            var stockDeficit = product.LowStockThreshold - product.StockQuantity;
            var daysSinceLastRestock = (DateTime.UtcNow - product.DateListed).Days;

            string priority;
            if (product.StockQuantity == 0)
                priority = "Critical";
            else if (product.StockQuantity <= product.LowStockThreshold / 2)
                priority = "High";
            else if (product.StockQuantity <= product.LowStockThreshold * 0.75)
                priority = "Medium";
            else
                priority = "Low";

            return new LowStockAlertDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductImage = product.ProductImage,
                CategoryName = product.Category.CategoryName,
                CurrentStock = product.StockQuantity,
                LowStockThreshold = product.LowStockThreshold,
                StockDeficit = stockDeficit > 0 ? stockDeficit : 0,
                IsOutOfStock = product.StockQuantity == 0,
                LastRestocked = product.DateListed,
                SellerId = product.SellerId,
                SellerShopName = product.Seller.ShopName,
                SellerPhone = product.Seller.ContactPhone,
                SellerEmail = product.Seller.ContactEmail,
                Priority = priority,
                DaysSinceLastRestock = daysSinceLastRestock
            };
        }

        // 🔧 ENHANCED: Multiple notification types for better seller awareness
        private async Task CreateLowStockNotificationAsync(Product product)
        {
            if (product.Seller == null)
            {
                var loadedProduct = await _context.Products
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

                if (loadedProduct?.Seller == null)
                    return;

                product = loadedProduct;
            }

            var notification = new Notification
            {
                UserId = product.Seller.UserId,
                NotificationType = nameof(NotificationType.LowStock),
                Message = $"⚠️ Low stock alert: {product.ProductName}",
                DetailedMessage = $"Your product '{product.ProductName}' has low stock. Current: {product.StockQuantity}, Threshold: {product.LowStockThreshold}. Please restock soon.",
                RelatedEntityId = product.ProductId,
                RelatedEntityType = "Product",
                DateCreated = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
        }

        private async Task CreateOutOfStockNotificationAsync(Product product)
        {
            if (product.Seller == null)
            {
                var loadedProduct = await _context.Products
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

                if (loadedProduct?.Seller == null)
                    return;

                product = loadedProduct;
            }

            var notification = new Notification
            {
                UserId = product.Seller.UserId,
                NotificationType = nameof(NotificationType.LowStock),
                Message = $"🔴 OUT OF STOCK: {product.ProductName}",
                DetailedMessage = $"URGENT: Your product '{product.ProductName}' is now out of stock. The product has been automatically deactivated from customer view. Please restock immediately.",
                RelatedEntityId = product.ProductId,
                RelatedEntityType = "Product",
                DateCreated = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);

            // Optionally auto-deactivate product
            product.IsActive = false;
        }

        private async Task CreateStockRestoredNotificationAsync(Product product)
        {
            if (product.Seller == null)
            {
                var loadedProduct = await _context.Products
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

                if (loadedProduct?.Seller == null)
                    return;

                product = loadedProduct;
            }

            var notification = new Notification
            {
                UserId = product.Seller.UserId,
                NotificationType = nameof(NotificationType.SystemAlert),
                Message = $"✅ Stock restored: {product.ProductName}",
                DetailedMessage = $"Good news! Your product '{product.ProductName}' stock has been restored. Current stock: {product.StockQuantity}. The product is now available for sale.",
                RelatedEntityId = product.ProductId,
                RelatedEntityType = "Product",
                DateCreated = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
        }


        // ================== STOCK ADJUSTMENT HISTORY ==================

        public async Task<ApiResponse<PagedResult<StockAdjustmentHistoryDto>>> GetStockAdjustmentHistoryAsync(
            StockHistoryFilterParams filterParams)
        {
            try
            {
                var query = _context.StockAdjustments
                    .Include(sa => sa.Product)
                    .Include(sa => sa.InventoryManager)
                    .AsQueryable();

                if (filterParams.ProductId.HasValue)
                {
                    query = query.Where(sa => sa.ProductId == filterParams.ProductId.Value);
                }

                if (!string.IsNullOrEmpty(filterParams.AdjustmentType))
                {
                    query = query.Where(sa => sa.AdjustmentType == filterParams.AdjustmentType);
                }

                if (filterParams.FromDate.HasValue)
                {
                    query = query.Where(sa => sa.AdjustmentDate >= filterParams.FromDate.Value);
                }

                if (filterParams.ToDate.HasValue)
                {
                    query = query.Where(sa => sa.AdjustmentDate <= filterParams.ToDate.Value);
                }

                if (filterParams.IsAutomated.HasValue)
                {
                    query = query.Where(sa => sa.IsAutomated == filterParams.IsAutomated.Value);
                }

                if (filterParams.InventoryManagerId.HasValue)
                {
                    query = query.Where(sa => sa.InventoryManagerId == filterParams.InventoryManagerId.Value);
                }

                if (!string.IsNullOrEmpty(filterParams.SearchTerm))
                {
                    query = query.Where(sa => sa.Product.ProductName.Contains(filterParams.SearchTerm) ||
                        (sa.Reason != null && sa.Reason.Contains(filterParams.SearchTerm)) ||
                        (sa.Notes != null && sa.Notes.Contains(filterParams.SearchTerm)));
                }

                query = query.ApplySorting(filterParams.SortBy ?? "AdjustmentDate",
                    filterParams.SortOrder == "asc" ? "asc" : "desc");

                var pagedResult = await query.ToPagedResultAsync(filterParams);

                var mappedItems = pagedResult.Items.Select(MapToStockAdjustmentHistoryDto).ToList();

                return ApiResponse<PagedResult<StockAdjustmentHistoryDto>>.SuccessResponse(
                    new PagedResult<StockAdjustmentHistoryDto>
                    {
                        Items = mappedItems,
                        PageNumber = pagedResult.PageNumber,
                        PageSize = pagedResult.PageSize,
                        TotalCount = pagedResult.TotalCount
                    });
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<StockAdjustmentHistoryDto>>.ErrorResponse(
                    $"Failed to retrieve stock history: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ProductStockHistoryDto>> GetProductStockHistoryAsync(
            int productId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId);

                if (product == null)
                    return ApiResponse<ProductStockHistoryDto>.ErrorResponse("Product not found");

                var query = _context.StockAdjustments
                    .Include(sa => sa.InventoryManager)
                    .Where(sa => sa.ProductId == productId);

                if (fromDate.HasValue)
                    query = query.Where(sa => sa.AdjustmentDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(sa => sa.AdjustmentDate <= toDate.Value);

                var adjustments = await query
                    .OrderByDescending(sa => sa.AdjustmentDate)
                    .ToListAsync();

                var totalIncreased = adjustments
                    .Where(sa => sa.QuantityChanged > 0)
                    .Sum(sa => sa.QuantityChanged);

                var totalDecreased = Math.Abs(adjustments
                    .Where(sa => sa.QuantityChanged < 0)
                    .Sum(sa => sa.QuantityChanged));

                var history = new ProductStockHistoryDto
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductImage = product.ProductImage,
                    CurrentStock = product.StockQuantity,
                    TotalAdjustments = adjustments.Count,
                    TotalIncreased = totalIncreased,
                    TotalDecreased = totalDecreased,
                    LastAdjustmentDate = adjustments.FirstOrDefault()?.AdjustmentDate,
                    AdjustmentHistory = adjustments.Select(MapToStockAdjustmentHistoryDto).ToList()
                };

                return ApiResponse<ProductStockHistoryDto>.SuccessResponse(history);
            }
            catch (Exception ex)
            {
                return ApiResponse<ProductStockHistoryDto>.ErrorResponse(
                    $"Failed to retrieve product stock history: {ex.Message}");
            }
        }

        public async Task<ApiResponse<StockAdjustmentStatsDto>> GetStockAdjustmentStatsAsync(
            DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.StockAdjustments
                    .Include(sa => sa.Product)
                    .AsQueryable();

                if (fromDate.HasValue)
                    query = query.Where(sa => sa.AdjustmentDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(sa => sa.AdjustmentDate <= toDate.Value);

                var adjustments = await query.ToListAsync();

                var today = DateTime.UtcNow.Date;
                var weekAgo = today.AddDays(-7);
                var monthAgo = today.AddMonths(-1);

                var stats = new StockAdjustmentStatsDto
                {
                    TotalAdjustments = adjustments.Count,
                    ManualAdjustments = adjustments.Count(a => !a.IsAutomated),
                    AutomatedAdjustments = adjustments.Count(a => a.IsAutomated),
                    TodaysAdjustments = adjustments.Count(a => a.AdjustmentDate.Date == today),
                    ThisWeekAdjustments = adjustments.Count(a => a.AdjustmentDate >= weekAgo),
                    ThisMonthAdjustments = adjustments.Count(a => a.AdjustmentDate >= monthAgo),
                    TotalStockIncreased = adjustments.Where(a => a.QuantityChanged > 0)
                        .Sum(a => a.QuantityChanged),
                    TotalStockDecreased = Math.Abs(adjustments.Where(a => a.QuantityChanged < 0)
                        .Sum(a => a.QuantityChanged))
                };

                var typeBreakdown = adjustments
                    .GroupBy(a => a.AdjustmentType)
                    .Select(g => new AdjustmentTypeBreakdownDto
                    {
                        AdjustmentType = g.Key,
                        Count = g.Count(),
                        TotalQuantityChanged = g.Sum(a => Math.Abs(a.QuantityChanged))
                    })
                    .OrderByDescending(t => t.Count)
                    .ToList();

                stats.AdjustmentsByType = typeBreakdown;

                var topProducts = adjustments
                    .GroupBy(a => new { a.ProductId, a.Product.ProductName, a.Product.ProductImage })
                    .Select(g => new TopAdjustedProductDto
                    {
                        ProductId = g.Key.ProductId,
                        ProductName = g.Key.ProductName,
                        ProductImage = g.Key.ProductImage,
                        AdjustmentCount = g.Count(),
                        TotalQuantityChanged = g.Sum(a => Math.Abs(a.QuantityChanged))
                    })
                    .OrderByDescending(p => p.AdjustmentCount)
                    .Take(10)
                    .ToList();

                stats.TopAdjustedProducts = topProducts;

                return ApiResponse<StockAdjustmentStatsDto>.SuccessResponse(stats);
            }
            catch (Exception ex)
            {
                return ApiResponse<StockAdjustmentStatsDto>.ErrorResponse(
                    $"Failed to retrieve adjustment stats: {ex.Message}");
            }
        }

        // ================== HELPER METHODS (ADD TO EXISTING SECTION) ==================

        private StockAdjustmentHistoryDto MapToStockAdjustmentHistoryDto(StockAdjustment adjustment)
        {
            return new StockAdjustmentHistoryDto
            {
                StockAdjustmentId = adjustment.StockAdjustmentId,
                ProductId = adjustment.ProductId,
                ProductName = adjustment.Product.ProductName,
                ProductImage = adjustment.Product.ProductImage,
                PreviousQuantity = adjustment.PreviousQuantity,
                NewQuantity = adjustment.NewQuantity,
                QuantityChanged = adjustment.QuantityChanged,
                AdjustmentType = adjustment.AdjustmentType,
                Reason = adjustment.Reason,
                Notes = adjustment.Notes,
                AdjustmentDate = adjustment.AdjustmentDate,
                AdjustedBy = adjustment.AdjustedBy,
                IsAutomated = adjustment.IsAutomated,
                RelatedEntityId = adjustment.RelatedEntityId,
                RelatedEntityType = adjustment.RelatedEntityType,
                InventoryManagerName = adjustment.InventoryManager?.FullName
            };
        }

        private async Task RecordStockAdjustmentAsync(
     int productId,
     int oldStock,
     int newStock,
     string adjustmentType,
     string? reason = null,
     string? notes = null,
     int? inventoryManagerId = null,
     bool isAutomated = false,
     int? relatedEntityId = null,
     string? relatedEntityType = null)
        {
            var adjustment = new StockAdjustment
            {
                ProductId = productId,
                PreviousQuantity = oldStock,
                NewQuantity = newStock,
                QuantityChanged = newStock - oldStock,
                AdjustmentType = adjustmentType,
                Reason = reason,
                Notes = notes,
                AdjustmentDate = DateTime.UtcNow,
                InventoryManagerId = inventoryManagerId,
                AdjustedBy = inventoryManagerId.HasValue ? "Inventory Manager" : "System",
                IsAutomated = isAutomated,
                RelatedEntityId = relatedEntityId,
                RelatedEntityType = relatedEntityType
            };

            await _context.StockAdjustments.AddAsync(adjustment);
            await _context.SaveChangesAsync();
        }

    }
}