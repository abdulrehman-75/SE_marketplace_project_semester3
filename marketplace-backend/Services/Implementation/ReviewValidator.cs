using MarketPlace.Data;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Customer;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class ReviewValidator : IReviewValidator
    {
        private readonly ApplicationDbContext _context;

        public ReviewValidator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewValidationResultDto> ValidateReviewAsync(
            int customerId, int productId, int orderId)
        {
            var result = new ReviewValidationResultDto
            {
                CanReview = true,
                DailyReviewsRemaining = await GetDailyLimitAsync()
            };

            // Check 1: Daily limit
            if (await HasExceededDailyLimitAsync(customerId))
            {
                var rateLimit = await CheckRateLimitAsync(customerId);
                result.CanReview = false;
                result.ReasonIfCannot = $"Daily review limit reached. You can post {rateLimit.ReviewsRemaining} more reviews today.";
                result.NextAllowedReviewTime = rateLimit.NextResetTime;
                result.DailyReviewsRemaining = 0;
                return result;
            }

            // Check 2: Time between reviews
            if (!await IsWithinMinimumTimeGapAsync(customerId))
            {
                var lastReview = await _context.Reviews
                    .Where(r => r.CustomerId == customerId)
                    .OrderByDescending(r => r.DatePosted)
                    .FirstOrDefaultAsync();

                if (lastReview != null)
                {
                    var minSeconds = await GetMinimumTimeBetweenReviewsAsync();
                    var nextAllowed = lastReview.DatePosted.AddSeconds(minSeconds);

                    result.CanReview = false;
                    result.ReasonIfCannot = $"Please wait {minSeconds / 60} minutes between reviews.";
                    result.NextAllowedReviewTime = nextAllowed;
                    return result;
                }
            }

            // Check 3: Already reviewed this product from this order
            var existingReviewForOrder = await _context.Reviews
                .FirstOrDefaultAsync(r => r.CustomerId == customerId &&
                                         r.ProductId == productId &&
                                         r.OrderId == orderId);

            if (existingReviewForOrder != null)
            {
                result.CanReview = false;
                result.ReasonIfCannot = "You have already reviewed this product from this order.";
                result.ExistingReviewId = existingReviewForOrder.ReviewId;
                return result;
            }

            // Check 4: Already reviewed this product (if config disallows multiple)
            var allowMultiple = await GetAllowMultipleReviewsPerProductAsync();
            if (!allowMultiple)
            {
                if (await HasAlreadyReviewedProductAsync(customerId, productId))
                {
                    var existingReview = await _context.Reviews
                        .FirstOrDefaultAsync(r => r.CustomerId == customerId &&
                                                 r.ProductId == productId);

                    result.CanReview = false;
                    result.ReasonIfCannot = "You have already reviewed this product. You can only review each product once.";
                    result.ExistingReviewId = existingReview?.ReviewId;
                    return result;
                }
            }

            // Check 5: Verify customer actually purchased this product in this order
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Order)
                .FirstOrDefaultAsync(oi => oi.OrderId == orderId &&
                                          oi.ProductId == productId &&
                                          oi.Order.CustomerId == customerId);

            if (orderItem == null)
            {
                result.CanReview = false;
                result.ReasonIfCannot = "You can only review products you have purchased.";
                return result;
            }

            // Check 6: Order must be completed
            if (orderItem.Order.OrderStatus != nameof(OrderStatus.Completed))
            {
                result.CanReview = false;
                result.ReasonIfCannot = "You can only review products from completed orders.";
                return result;
            }

            // Check 7: Purchase-to-review ratio (prevent review farms)
            var totalCompletedOrders = await _context.Orders
                .CountAsync(o => o.CustomerId == customerId &&
                                o.OrderStatus == nameof(OrderStatus.Completed));

            var totalReviews = await _context.Reviews
                .CountAsync(r => r.CustomerId == customerId);

            // Allow new customers some leeway
            if (totalCompletedOrders >= 3)
            {
                var minRatio = await GetMinimumPurchaseToReviewRatioAsync();
                var ratio = (double)totalReviews / totalCompletedOrders;

                if (ratio > minRatio)
                {
                    result.CanReview = false;
                    result.ReasonIfCannot = "Please complete more orders before posting additional reviews.";
                    return result;
                }
            }

            // Calculate remaining reviews for today
            var rateInfo = await CheckRateLimitAsync(customerId);
            result.DailyReviewsRemaining = rateInfo.ReviewsRemaining;

            return result;
        }

        public async Task<ReviewRateLimitDto> CheckRateLimitAsync(int customerId)
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var todaysReviews = await _context.Reviews
                .CountAsync(r => r.CustomerId == customerId &&
                                r.DatePosted >= today &&
                                r.DatePosted < tomorrow);

            var dailyLimit = await GetDailyLimitAsync();

            return new ReviewRateLimitDto
            {
                TotalReviewsToday = todaysReviews,
                DailyLimit = dailyLimit,
                ReviewsRemaining = Math.Max(0, dailyLimit - todaysReviews),
                NextResetTime = tomorrow,
                IsLimited = todaysReviews >= dailyLimit
            };
        }

        public async Task<bool> HasExceededDailyLimitAsync(int customerId)
        {
            var rateLimit = await CheckRateLimitAsync(customerId);
            return rateLimit.IsLimited;
        }

        public async Task<bool> IsWithinMinimumTimeGapAsync(int customerId)
        {
            var lastReview = await _context.Reviews
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.DatePosted)
                .FirstOrDefaultAsync();

            if (lastReview == null)
                return true;

            var minSeconds = await GetMinimumTimeBetweenReviewsAsync();
            var timeSinceLastReview = DateTime.UtcNow - lastReview.DatePosted;
            return timeSinceLastReview.TotalSeconds >= minSeconds;
        }

        public async Task<bool> HasAlreadyReviewedProductAsync(int customerId, int productId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.CustomerId == customerId && r.ProductId == productId);
        }

        // ================== CONFIGURATION HELPERS ==================

        private async Task<int> GetDailyLimitAsync()
        {
            var config = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.ConfigKey == "Review:DailyLimit");

            if (config != null && int.TryParse(config.ConfigValue, out int limit))
            {
                return limit;
            }

            return ReviewSpamConfig.DEFAULT_DAILY_LIMIT;
        }

        private async Task<int> GetMinimumTimeBetweenReviewsAsync()
        {
            var config = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.ConfigKey == "Review:MinimumTimeBetweenReviews");

            if (config != null && int.TryParse(config.ConfigValue, out int seconds))
            {
                return seconds;
            }

            return ReviewSpamConfig.DEFAULT_MIN_SECONDS_BETWEEN_REVIEWS;
        }

        private async Task<bool> GetAllowMultipleReviewsPerProductAsync()
        {
            var config = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.ConfigKey == "Review:AllowMultipleReviewsPerProduct");

            if (config != null && bool.TryParse(config.ConfigValue, out bool allow))
            {
                return allow;
            }

            return ReviewSpamConfig.DEFAULT_ALLOW_MULTIPLE_PER_PRODUCT;
        }

        private async Task<double> GetMinimumPurchaseToReviewRatioAsync()
        {
            var config = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.ConfigKey == "Review:MinimumPurchaseToReviewRatio");

            if (config != null && double.TryParse(config.ConfigValue, out double ratio))
            {
                return ratio;
            }

            return ReviewSpamConfig.DEFAULT_MIN_PURCHASE_RATIO;
        }
    }
}