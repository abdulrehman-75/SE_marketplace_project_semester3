using MarketPlace.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MarketPlace.Helpers
{
    public interface IStockManager
    {
        Task<bool> CheckStockAvailabilityAsync(int productId, int quantity);
        Task<bool> ReduceStockAsync(int productId, int quantity);
        Task<bool> RestoreStockAsync(int productId, int quantity);
        Task<List<int>> GetLowStockProductsAsync(int sellerId);

        Task<StockReservationResult> ReserveStockAsync(int productId, int quantity, int maxRetries = 3);
        Task<bool> ReleaseStockReservationAsync(int productId, int quantity);
    }

    public class StockReservationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int AvailableStock { get; set; }
        public bool IsRetryable { get; set; }
    }

    public class StockManager : IStockManager
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StockManager> _logger;

        public StockManager(ApplicationDbContext context, ILogger<StockManager> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> CheckStockAvailabilityAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            return product != null && product.StockQuantity >= quantity && product.IsActive;
        }

        public async Task<bool> ReduceStockAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null || product.StockQuantity < quantity)
                return false;

            product.StockQuantity -= quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreStockAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return false;

            product.StockQuantity += quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<int>> GetLowStockProductsAsync(int sellerId)
        {
            return await _context.Products
                .Where(p => p.SellerId == sellerId &&
                           p.StockQuantity <= p.LowStockThreshold &&
                           p.IsActive)
                .Select(p => p.ProductId)
                .ToListAsync();
        }

        /// <summary>
        /// Atomically reserve stock with optimistic locking and retry logic
        /// </summary>
        public async Task<StockReservationResult> ReserveStockAsync(int productId, int quantity, int maxRetries = 3)
        {
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    // Load product with tracking for concurrency check
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductId == productId);

                    if (product == null)
                    {
                        return new StockReservationResult
                        {
                            Success = false,
                            Message = "Product not found",
                            AvailableStock = 0,
                            IsRetryable = false
                        };
                    }

                    if (!product.IsActive)
                    {
                        return new StockReservationResult
                        {
                            Success = false,
                            Message = "Product is not active",
                            AvailableStock = 0,
                            IsRetryable = false
                        };
                    }

                    // Check stock availability
                    if (product.StockQuantity < quantity)
                    {
                        return new StockReservationResult
                        {
                            Success = false,
                            Message = $"Insufficient stock. Available: {product.StockQuantity}, Requested: {quantity}",
                            AvailableStock = product.StockQuantity,
                            IsRetryable = false
                        };
                    }

                    // Atomically reduce stock
                    product.StockQuantity -= quantity;

                    // Save with concurrency check
                    await _context.SaveChangesAsync();

                    _logger.LogInformation(
                        "Stock reserved successfully. ProductId: {ProductId}, Quantity: {Quantity}, Remaining: {Remaining}",
                        productId, quantity, product.StockQuantity);

                    return new StockReservationResult
                    {
                        Success = true,
                        Message = "Stock reserved successfully",
                        AvailableStock = product.StockQuantity,
                        IsRetryable = false
                    };
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    retryCount++;
                    _logger.LogWarning(
                        "Concurrency conflict while reserving stock. ProductId: {ProductId}, Attempt: {Attempt}/{MaxRetries}",
                        productId, retryCount, maxRetries);

                    // Detach the conflicting entity
                    foreach (var entry in ex.Entries)
                    {
                        await entry.ReloadAsync();
                    }

                    if (retryCount >= maxRetries)
                    {
                        return new StockReservationResult
                        {
                            Success = false,
                            Message = "Unable to reserve stock due to high demand. Please try again.",
                            AvailableStock = 0,
                            IsRetryable = true
                        };
                    }

                    // Short delay before retry
                    await Task.Delay(50 * retryCount);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error reserving stock for ProductId: {ProductId}", productId);

                    return new StockReservationResult
                    {
                        Success = false,
                        Message = "An error occurred while reserving stock",
                        AvailableStock = 0,
                        IsRetryable = false
                    };
                }
            }

            return new StockReservationResult
            {
                Success = false,
                Message = "Failed to reserve stock after maximum retries",
                AvailableStock = 0,
                IsRetryable = true
            };
        }

        public async Task<bool> ReleaseStockReservationAsync(int productId, int quantity)
        {
            var maxRetries = 3;
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductId == productId);

                    if (product == null)
                        return false;

                    product.StockQuantity += quantity;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation(
                        "Stock reservation released. ProductId: {ProductId}, Quantity: {Quantity}, New Stock: {NewStock}",
                        productId, quantity, product.StockQuantity);

                    return true;
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    retryCount++;
                    _logger.LogWarning(
                        "Concurrency conflict while releasing stock. ProductId: {ProductId}, Attempt: {Attempt}/{MaxRetries}",
                        productId, retryCount, maxRetries);

                    foreach (var entry in ex.Entries)
                    {
                        await entry.ReloadAsync();
                    }

                    if (retryCount >= maxRetries)
                        return false;

                    await Task.Delay(50 * retryCount);
                }
            }

            return false;
        }
    }
}
