using MarketPlace.Data;
using MarketPlace.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MarketPlace.Services.BackgroundServices
{
    public class PaymentReleaseBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PaymentReleaseBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(10); // Check every 10 minutes

        public PaymentReleaseBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<PaymentReleaseBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Payment Release Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessExpiredVerificationsAsync();
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Payment Release Background Service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retry
                }
            }
        }

        private async Task ProcessExpiredVerificationsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            // Find all expired verification periods where customer hasn't responded
            var expiredOrders = await context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Customer)
                .Where(o =>
                    o.OrderStatus == nameof(OrderStatus.Delivered) &&
                    o.PaymentStatus == nameof(PaymentStatus.VerificationPeriod) &&
                    !o.CustomerConfirmedReceipt &&
                    !o.CustomerReportedProblem &&
                    o.VerificationPeriodEnd.HasValue &&
                    o.VerificationPeriodEnd.Value <= now)
                .ToListAsync();

            if (!expiredOrders.Any())
            {
                _logger.LogInformation($"No expired verification periods found at {now:yyyy-MM-dd HH:mm:ss}");
                return;
            }

            _logger.LogInformation($"Processing {expiredOrders.Count} expired verification periods");

            foreach (var order in expiredOrders)
            {
                await AutoReleasePaymentAsync(context, order);
            }

            await context.SaveChangesAsync();
        }

        private async Task AutoReleasePaymentAsync(ApplicationDbContext context, Order order)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Auto-releasing payment for Order #{order.OrderId}");

                // Update order status
                order.PaymentStatus = nameof(PaymentStatus.AutoReleased);
                order.OrderStatus = nameof(OrderStatus.Completed);

                // Group order items by seller
                var sellerGroups = order.OrderItems.GroupBy(oi => oi.SellerId);

                foreach (var group in sellerGroups)
                {
                    var sellerId = group.Key;
                    var amount = group.Sum(oi => oi.Subtotal);

                    // Create or update payment verification
                    var verification = await context.PaymentVerifications
                        .FirstOrDefaultAsync(pv => pv.OrderId == order.OrderId && pv.SellerId == sellerId);

                    if (verification == null)
                    {
                        verification = new PaymentVerification
                        {
                            OrderId = order.OrderId,
                            SellerId = sellerId,
                            Amount = amount,
                            VerificationStartDate = order.VerificationPeriodStart!.Value,
                            VerificationEndDate = order.VerificationPeriodEnd!.Value,
                            Status = nameof(PaymentStatus.AutoReleased),
                            CustomerAction = "AutoReleased_NoResponse",
                            ActionDate = DateTime.UtcNow,
                            ReleasedDate = DateTime.UtcNow,
                            ReleasedBy = "System_AutoRelease",
                            Notes = "Payment automatically released after verification period expired without customer response"
                        };
                        context.PaymentVerifications.Add(verification);
                    }
                    else
                    {
                        verification.Status = nameof(PaymentStatus.AutoReleased);
                        verification.CustomerAction = "AutoReleased_NoResponse";
                        verification.ActionDate = DateTime.UtcNow;
                        verification.ReleasedDate = DateTime.UtcNow;
                        verification.ReleasedBy = "System_AutoRelease";
                    }

                    // Update seller metrics
                    var seller = await context.Sellers.FindAsync(sellerId);
                    if (seller != null)
                    {
                        seller.TotalSales += amount;
                        seller.TotalOrders++;

                        // Send notification to seller
                        var notification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.PaymentReleased),
                            Message = $"Payment of {amount:C} auto-released for Order #{order.OrderId}",
                            DetailedMessage = "Payment was automatically released after verification period expired without customer response",
                            RelatedEntityId = order.OrderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        context.Notifications.Add(notification);
                    }
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Successfully auto-released payment for Order #{order.OrderId}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Failed to auto-release payment for Order #{order.OrderId}");
            }
        }
    }
}