using MarketPlace.Data;
using MarketPlace.Extensions;
using MarketPlace.Helpers;
using MarketPlace.Models;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Customer;
using MarketPlace.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Services.Implementation
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentCalculator _paymentCalculator;
        private readonly IStockManager _stockManager;
        private readonly IRatingCalculator _ratingCalculator;
        private readonly IReviewValidator _reviewValidator;

        public CustomerService(
            ApplicationDbContext context,
            IPaymentCalculator paymentCalculator,
            IStockManager stockManager,
            IRatingCalculator ratingCalculator,
            IReviewValidator reviewValidator)
        {
            _context = context;
            _paymentCalculator = paymentCalculator;
            _stockManager = stockManager;
            _ratingCalculator = ratingCalculator;
            _reviewValidator = reviewValidator;
        }

        // ================== PROFILE MANAGEMENT ==================

        public async Task<CustomerProfileDto?> GetProfileAsync(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .Include(c => c.FollowedSellers)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (customer == null) return null;

            return new CustomerProfileDto
            {
                CustomerId = customer.CustomerId,
                FullName = customer.FullName,
                Email = customer.User.Email!,
                Phone = customer.Phone,
                ShippingAddress = customer.ShippingAddress,
                City = customer.City,
                PostalCode = customer.PostalCode,
                Country = customer.Country,
                DateRegistered = customer.DateRegistered,
                TotalOrders = customer.TotalOrders,
                TotalSpent = customer.TotalSpent,
                FollowedSellersCount = customer.FollowedSellers.Count
            };
        }

        public async Task<bool> UpdateProfileAsync(int customerId, UpdateCustomerProfileDto dto)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null) return false;

            customer.FullName = dto.FullName;
            customer.Phone = dto.Phone;
            customer.ShippingAddress = dto.ShippingAddress;
            customer.City = dto.City;
            customer.PostalCode = dto.PostalCode;
            customer.Country = dto.Country;

            await _context.SaveChangesAsync();
            return true;
        }

        // ================== PRODUCT BROWSING ==================

        public async Task<PagedResult<ProductListDto>> GetAllProductsAsync(ProductFilterParams filterParams)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .Include(p => p.Reviews)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filterParams.Category))
            {
                query = query.Where(p => p.Category.CategoryName.ToLower() == filterParams.Category.ToLower());
            }

            if (filterParams.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filterParams.MinPrice.Value);
            }

            if (filterParams.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filterParams.MaxPrice.Value);
            }

            if (!string.IsNullOrEmpty(filterParams.SearchTerm))
            {
                var searchLower = filterParams.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.ProductName.ToLower().Contains(searchLower) ||
                    p.Description!.ToLower().Contains(searchLower));
            }

            if (filterParams.InStock == true)
            {
                query = query.Where(p => p.StockQuantity > 0);
            }

            if (filterParams.SellerId.HasValue)
            {
                query = query.Where(p => p.SellerId == filterParams.SellerId.Value);
            }

            query = query.ApplySorting(filterParams.SortBy ?? "DateListed", filterParams.SortOrder);

            var pagedEntities = await query.ToPagedResultAsync(filterParams);

            var dtoItems = pagedEntities.Items.Select(p => new ProductListDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                IsActive = p.IsActive,
                CategoryName = p.Category.CategoryName,
                SellerId = p.SellerId,
                SellerShopName = p.Seller.ShopName,
                SellerRating = p.Seller.OverallRating,
                ReviewCount = p.Reviews.Count(r => r.IsApproved),
                AverageRating = p.Reviews.Any(r => r.IsApproved)
                    ? (decimal)p.Reviews.Where(r => r.IsApproved).Average(r => r.Rating)
                    : 0
            }).ToList();

            return new PagedResult<ProductListDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<ProductDetailDto?> GetProductDetailAsync(int productId, int? customerId = null)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Seller)
                .Include(p => p.Reviews.Where(r => r.IsApproved))
                    .ThenInclude(r => r.Customer)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null) return null;

            bool isFollowed = false;
            if (customerId.HasValue)
            {
                isFollowed = await _context.SellerFollowers
                    .AnyAsync(sf => sf.CustomerId == customerId.Value && sf.SellerId == product.SellerId);
            }

            return new ProductDetailDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductImage = product.ProductImage,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                DateListed = product.DateListed,
                CategoryName = product.Category.CategoryName,
                SellerId = product.SellerId,
                SellerShopName = product.Seller.ShopName,
                SellerShopLogo = product.Seller.ShopLogo,
                SellerOverallRating = product.Seller.OverallRating,
                SellerTotalReviews = product.Seller.TotalReviews,
                IsSellerFollowed = isFollowed,
                Reviews = product.Reviews.Select(r => new ProductReviewDto
                {
                    ReviewId = r.ReviewId,
                    CustomerName = r.Customer.FullName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    DatePosted = r.DatePosted,
                    IsVerifiedPurchase = r.IsVerifiedPurchase
                }).ToList(),
                AverageRating = product.Reviews.Any()
                    ? (decimal)product.Reviews.Average(r => r.Rating)
                    : 0,
                TotalReviews = product.Reviews.Count
            };
        }

        public async Task<PagedResult<ProductListDto>> SearchProductsAsync(string searchTerm, ProductFilterParams filterParams)
        {
            filterParams.SearchTerm = searchTerm;
            return await GetAllProductsAsync(filterParams);
        }

        // ================== CART MANAGEMENT ==================

        public async Task<CartDto?> GetCartAsync(int customerId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                        .ThenInclude(p => p.Seller)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                cart = new Cart { CustomerId = customerId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var cartDto = new CartDto
            {
                CartId = cart.CartId,
                Items = cart.CartItems.Select(ci => new CartItemDto
                {
                    CartItemId = ci.CartItemId,
                    ProductId = ci.ProductId,
                    ProductName = ci.Product.ProductName,
                    ProductImage = ci.Product.ProductImage,
                    Price = ci.Product.Price,
                    Quantity = ci.Quantity,
                    Subtotal = ci.Product.Price * ci.Quantity,
                    StockQuantity = ci.Product.StockQuantity,
                    IsActive = ci.Product.IsActive,
                    SellerId = ci.Product.SellerId,
                    SellerShopName = ci.Product.Seller.ShopName
                }).ToList()
            };

            cartDto.Subtotal = cartDto.Items.Sum(i => i.Subtotal);
            cartDto.BuyerProtectionFee = _paymentCalculator.CalculateBuyerProtectionFee(cartDto.Subtotal);
            cartDto.GrandTotal = _paymentCalculator.CalculateGrandTotal(cartDto.Subtotal);
            cartDto.TotalItems = cartDto.Items.Sum(i => i.Quantity);

            return cartDto;
        }

        public async Task<bool> AddToCartAsync(int customerId, AddToCartDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.CustomerId == customerId);

                if (cart == null)
                {
                    cart = new Cart { CustomerId = customerId };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                // Check if item already exists in cart
                var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);
                var requestedQuantity = dto.Quantity;
                var totalQuantity = requestedQuantity;

                if (existingItem != null)
                {
                    totalQuantity = existingItem.Quantity + requestedQuantity;
                }

                // Atomically reserve stock with retry logic
                var reservationResult = await _stockManager.ReserveStockAsync(dto.ProductId, requestedQuantity);

                if (!reservationResult.Success)
                {
                    await transaction.RollbackAsync();

                    // Log specific failure reason
                    if (reservationResult.AvailableStock > 0)
                    {
                        throw new InvalidOperationException(
                            $"Cannot add to cart. Only {reservationResult.AvailableStock} items available in stock.");
                    }

                    return false;
                }

                // Stock reserved successfully - update cart
                if (existingItem != null)
                {
                    existingItem.Quantity = totalQuantity;
                }
                else
                {
                    cart.CartItems.Add(new CartItem
                    {
                        CartId = cart.CartId,
                        ProductId = dto.ProductId,
                        Quantity = requestedQuantity
                    });
                }

                cart.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException("Failed to add item to cart. Please try again.", ex);
            }
        }
        public async Task<bool> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cartItem = await _context.CartItems
                    .Include(ci => ci.Cart)
                    .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.Cart.CustomerId == customerId);

                if (cartItem == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                var currentQuantity = cartItem.Quantity;
                var newQuantity = dto.Quantity;
                var difference = newQuantity - currentQuantity;

                if (difference > 0)
                {
                    // Increasing quantity - reserve additional stock
                    var reservationResult = await _stockManager.ReserveStockAsync(cartItem.ProductId, difference);

                    if (!reservationResult.Success)
                    {
                        await transaction.RollbackAsync();

                        if (reservationResult.AvailableStock > 0)
                        {
                            var maxPossible = currentQuantity + reservationResult.AvailableStock;
                            throw new InvalidOperationException(
                                $"Cannot update quantity. Maximum available: {maxPossible} items (you currently have {currentQuantity} in cart).");
                        }

                        return false;
                    }
                }
                else if (difference < 0)
                {
                    // Decreasing quantity - release stock
                    var releaseQuantity = Math.Abs(difference);
                    await _stockManager.ReleaseStockReservationAsync(cartItem.ProductId, releaseQuantity);
                }
                // If difference == 0, no stock change needed

                cartItem.Quantity = newQuantity;
                cartItem.Cart.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException("Failed to update cart item. Please try again.", ex);
            }
        }
        public async Task<bool> RemoveFromCartAsync(int customerId, int cartItemId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cartItem = await _context.CartItems
                    .Include(ci => ci.Cart)
                    .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.Cart.CustomerId == customerId);

                if (cartItem == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                // Release reserved stock back to inventory
                await _stockManager.ReleaseStockReservationAsync(cartItem.ProductId, cartItem.Quantity);

                _context.CartItems.Remove(cartItem);
                cartItem.Cart.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException("Failed to remove item from cart. Please try again.", ex);
            }
        }

        public async Task<bool> ClearCartAsync(int customerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.CustomerId == customerId);

                if (cart == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                // Release all reserved stock
                foreach (var item in cart.CartItems)
                {
                    await _stockManager.ReleaseStockReservationAsync(item.ProductId, item.Quantity);
                }

                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException("Failed to clear cart. Please try again.", ex);
            }
        }

        // ================== ORDER MANAGEMENT ==================

        public async Task<int> CreateOrderAsync(int customerId, CreateOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                            .ThenInclude(p => p.Seller)
                    .FirstOrDefaultAsync(c => c.CustomerId == customerId);

                if (cart == null || !cart.CartItems.Any())
                    throw new InvalidOperationException("Cart is empty");

                // Re-validate stock before final order creation
                foreach (var item in cart.CartItems)
                {
                    var currentStock = await _context.Products
                        .AsNoTracking()
                        .Where(p => p.ProductId == item.ProductId)
                        .Select(p => p.StockQuantity)
                        .FirstOrDefaultAsync();

                    if (currentStock < item.Quantity)
                    {
                        throw new InvalidOperationException(
                            $"Insufficient stock for {item.Product.ProductName}. Available: {currentStock}, Required: {item.Quantity}");
                    }
                }

                // Calculate totals
                decimal totalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);
                decimal buyerProtectionFee = _paymentCalculator.CalculateBuyerProtectionFee(totalAmount);
                decimal grandTotal = _paymentCalculator.CalculateGrandTotal(totalAmount);

                // Create order
                var order = new Order
                {
                    CustomerId = customerId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = totalAmount,
                    BuyerProtectionFee = buyerProtectionFee,
                    GrandTotal = grandTotal,
                    OrderStatus = nameof(OrderStatus.Pending),
                    PaymentStatus = nameof(PaymentStatus.Pending),
                    PaymentMethod = "Cash on Delivery",
                    DeliveryAddress = dto.DeliveryAddress,
                    DeliveryCity = dto.DeliveryCity,
                    DeliveryPostalCode = dto.DeliveryPostalCode,
                    CustomerPhone = dto.CustomerPhone
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Create order items
                foreach (var cartItem in cart.CartItems)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.OrderId,
                        ProductId = cartItem.ProductId,
                        SellerId = cartItem.Product.SellerId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = cartItem.Product.Price,
                        Subtotal = cartItem.Product.Price * cartItem.Quantity,
                        ProductName = cartItem.Product.ProductName,
                        ProductImage = cartItem.Product.ProductImage
                    };

                    _context.OrderItems.Add(orderItem);
                }

                // Clear cart
                _context.CartItems.RemoveRange(cart.CartItems);

                // Create notifications for sellers
                var sellerIds = cart.CartItems.Select(ci => ci.Product.SellerId).Distinct();
                foreach (var sellerId in sellerIds)
                {
                    var seller = await _context.Sellers.FindAsync(sellerId);
                    if (seller != null)
                    {
                        var notification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.OrderPlaced),
                            Message = $"New order #{order.OrderId} has been placed",
                            RelatedEntityId = order.OrderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow
                        };

                        _context.Notifications.Add(notification);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return order.OrderId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<PagedResult<CustomerOrderDto>> GetOrderHistoryAsync(int customerId, OrderFilterParams filterParams)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .Include(o => o.DeliveryStaff)
                .Where(o => o.CustomerId == customerId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filterParams.OrderStatus))
            {
                query = query.Where(o => o.OrderStatus == filterParams.OrderStatus);
            }

            if (!string.IsNullOrEmpty(filterParams.PaymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == filterParams.PaymentStatus);
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

            var dtoItems = pagedEntities.Items.Select(o => MapToCustomerOrderDto(o)).ToList();

            return new PagedResult<CustomerOrderDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<CustomerOrderDto?> GetOrderDetailsAsync(int customerId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .Include(o => o.DeliveryStaff)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customerId);

            if (order == null) return null;

            return MapToCustomerOrderDto(order);
        }

        public async Task<OrderTrackingDto?> TrackOrderAsync(int customerId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.DeliveryStaff)
                    .ThenInclude(ds => ds!.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customerId);

            if (order == null) return null;

            // Existing verification period logic
            bool isInVerificationPeriod = order.OrderStatus == nameof(OrderStatus.Delivered) &&
                                         order.VerificationPeriodEnd.HasValue &&
                                         order.VerificationPeriodEnd.Value > DateTime.UtcNow;

            bool canConfirm = isInVerificationPeriod &&
                             !order.CustomerConfirmedReceipt &&
                             !order.CustomerReportedProblem;

            bool canReport = isInVerificationPeriod &&
                            !order.CustomerConfirmedReceipt &&
                            !order.CustomerReportedProblem;

            // ✅ NEW: Cancellation logic - Only Pending orders can be cancelled
            bool canCancel = order.OrderStatus == nameof(OrderStatus.Pending) &&
                            !order.CustomerReportedProblem;

            return new OrderTrackingDto
            {
                OrderId = order.OrderId,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.PaymentStatus,
                OrderDate = order.OrderDate,
                DeliveryDate = order.DeliveryDate,
                VerificationPeriodEnd = order.VerificationPeriodEnd,
                CanConfirmReceipt = canConfirm,
                CanReportProblem = canReport,
                CanCancel = canCancel, // ✅ NEW
                DeliveryStaffName = order.DeliveryStaff?.FullName,
                StatusHistory = BuildStatusHistory(order)
            };
        }

        // Add this method to your CustomerService.cs class in the ORDER MANAGEMENT section

        /// <summary>
        /// Cancel order - Only allowed when status is Pending (before seller confirms)
        /// Restores stock, updates payment verification, and notifies sellers
        /// </summary>
        public async Task<CancelOrderResponseDto> CancelOrderAsync(int customerId, int orderId, CancelOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. RETRIEVE ORDER WITH ALL DEPENDENCIES
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Seller)
                    .Include(o => o.PaymentVerifications)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customerId);

                if (order == null)
                {
                    throw new InvalidOperationException("Order not found or does not belong to you.");
                }

                // 2. VALIDATE CANCELLATION ELIGIBILITY
                if (order.OrderStatus != nameof(OrderStatus.Pending))
                {
                    throw new InvalidOperationException(
                        $"Cannot cancel order. Order is already {order.OrderStatus}. " +
                        "Cancellation is only allowed for Pending orders before seller confirmation.");
                }

                if (order.OrderStatus == nameof(OrderStatus.Cancelled))
                {
                    throw new InvalidOperationException("This order has already been cancelled.");
                }

                if (order.OrderStatus == nameof(OrderStatus.Disputed))
                {
                    throw new InvalidOperationException(
                        "Cannot cancel disputed orders. Please contact support.");
                }

                // 3. RESTORE STOCK FOR ALL ORDER ITEMS
                var restoredItems = new List<RestoredStockDto>();

                foreach (var orderItem in order.OrderItems)
                {
                    var stockRestored = await _stockManager.ReleaseStockReservationAsync(
                        orderItem.ProductId,
                        orderItem.Quantity);

                    if (!stockRestored)
                    {
                        _context.ChangeTracker.Clear();
                        await transaction.RollbackAsync();
                        throw new InvalidOperationException(
                            $"Failed to restore stock for product {orderItem.ProductName}. " +
                            "Please contact support.");
                    }

                    restoredItems.Add(new RestoredStockDto
                    {
                        ProductId = orderItem.ProductId,
                        ProductName = orderItem.ProductName,
                        Quantity = orderItem.Quantity
                    });
                }

                // 4. UPDATE ORDER STATUS
                order.OrderStatus = nameof(OrderStatus.Cancelled);
                order.PaymentStatus = nameof(PaymentStatus.Cancelled);
                order.CancelledDate = DateTime.UtcNow;
                order.CancellationReason = dto.CancellationReason;

                // 5. UPDATE PAYMENT VERIFICATIONS
                foreach (var verification in order.PaymentVerifications)
                {
                    verification.Status = nameof(PaymentStatus.Cancelled);
                    verification.CustomerAction = "Cancelled Order";
                    verification.ActionDate = DateTime.UtcNow;
                }

                // 6. REVERT CUSTOMER METRICS (only if order was delivered and payment collected)
                // ✅ UPDATED LOGIC
                var customer = await _context.Customers.FindAsync(customerId);
                if (customer != null && order.DeliveryDate.HasValue)
                {
                    customer.TotalOrders = Math.Max(0, customer.TotalOrders - 1);
                    customer.TotalSpent = Math.Max(0, customer.TotalSpent - order.GrandTotal);
                }
                // If order was never delivered, metrics were never updated → nothing to revert

                // 7. NOTIFY ALL AFFECTED SELLERS
                var sellerIds = order.OrderItems.Select(oi => oi.SellerId).Distinct();
                foreach (var sellerId in sellerIds)
                {
                    var seller = await _context.Sellers.FindAsync(sellerId);
                    if (seller != null)
                    {
                        var sellerOrderItems = order.OrderItems
                            .Where(oi => oi.SellerId == sellerId)
                            .ToList();

                        var sellerAmount = sellerOrderItems.Sum(oi => oi.Subtotal);
                        var itemCount = sellerOrderItems.Sum(oi => oi.Quantity);

                        var notification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.OrderCancelled),
                            Message = $"Order #{orderId} has been cancelled by customer",
                            DetailedMessage =
                                $"Cancelled items: {itemCount} item(s) worth {sellerAmount:C}. " +
                                $"Reason: {dto.CancellationReason}",
                            RelatedEntityId = orderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(notification);
                    }
                }

                // 8. SAVE ALL CHANGES
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 9. RETURN CANCELLATION RESPONSE
                return new CancelOrderResponseDto
                {
                    OrderId = orderId,
                    CancelledDate = order.CancelledDate!.Value,
                    CancellationReason = order.CancellationReason!,
                    RefundAmount = order.GrandTotal,
                    RestoredItems = restoredItems
                };
            }
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException(
                    "An error occurred while cancelling the order. Please try again or contact support.", ex);
            }
        }


        // ================== ORDER VERIFICATION ==================

        public async Task<bool> ConfirmReceiptAsync(int customerId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customerId);

            if (order == null) return false;

            // ✅ FIX: Validate order can be confirmed
            if (order.OrderStatus != nameof(OrderStatus.Delivered))
                return false;

            if (order.CustomerConfirmedReceipt || order.CustomerReportedProblem)
                return false;

            // ✅ FIX: Check verification period is still active
            if (!order.VerificationPeriodEnd.HasValue ||
                order.VerificationPeriodEnd.Value <= DateTime.UtcNow)
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                order.CustomerConfirmedReceipt = true;
                order.PaymentStatus = nameof(PaymentStatus.Confirmed);
                order.OrderStatus = nameof(OrderStatus.Completed);

                // Update payment verifications
                var verifications = await _context.PaymentVerifications
                    .Where(pv => pv.OrderId == orderId)
                    .ToListAsync();

                foreach (var verification in verifications)
                {
                    verification.Status = nameof(PaymentStatus.Released);
                    verification.CustomerAction = "Confirmed";
                    verification.ActionDate = DateTime.UtcNow;
                    verification.ReleasedDate = DateTime.UtcNow;
                }

                // Update seller metrics and notify
                var sellerGroups = order.OrderItems.GroupBy(oi => oi.SellerId);
                foreach (var group in sellerGroups)
                {
                    var amount = group.Sum(oi => oi.Subtotal);
                    var seller = await _context.Sellers.FindAsync(group.Key);
                    if (seller != null)
                    {
                        seller.TotalSales += amount;
                        seller.TotalOrders++;

                        // ✅ FIX: Add timestamp to notification
                        var notification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.PaymentReleased),
                            Message = $"Payment of {amount:C} has been released for order #{orderId}",
                            RelatedEntityId = orderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                    }
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

        public async Task<bool> ReportProblemAsync(int customerId, ReportProblemDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId && o.CustomerId == customerId);

            if (order == null) return false;

            // ✅ FIX: Validate order can have problem reported
            if (order.OrderStatus != nameof(OrderStatus.Delivered))
                return false;

            if (order.CustomerConfirmedReceipt || order.CustomerReportedProblem)
                return false;

            // ✅ FIX: Check verification period is still active
            if (!order.VerificationPeriodEnd.HasValue ||
                order.VerificationPeriodEnd.Value <= DateTime.UtcNow)
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                order.CustomerReportedProblem = true;
                order.ProblemDescription = dto.ProblemDescription;
                order.PaymentStatus = nameof(PaymentStatus.Frozen);
                order.OrderStatus = nameof(OrderStatus.Disputed);

                // Update payment verifications to frozen
                var verifications = await _context.PaymentVerifications
                    .Where(pv => pv.OrderId == dto.OrderId)
                    .ToListAsync();

                foreach (var verification in verifications)
                {
                    verification.Status = nameof(PaymentStatus.Frozen);
                    verification.CustomerAction = "Reported Problem";
                    verification.ActionDate = DateTime.UtcNow;
                }

                // Create complaint
                var complaint = new Complaint
                {
                    OrderId = dto.OrderId,
                    CustomerId = customerId,
                    ComplaintType = nameof(ComplaintType.ProductQuality),
                    Description = dto.ProblemDescription,
                    Status = nameof(ComplaintStatus.Open),
                    Priority = "Medium",
                    DateReported = DateTime.UtcNow
                };
                _context.Complaints.Add(complaint);

                // ✅ FIX: Notify all affected sellers with timestamp
                var sellerIds = order.OrderItems.Select(oi => oi.SellerId).Distinct();
                foreach (var sellerId in sellerIds)
                {
                    var seller = await _context.Sellers.FindAsync(sellerId);
                    if (seller != null)
                    {
                        var notification = new Notification
                        {
                            UserId = seller.UserId,
                            NotificationType = nameof(NotificationType.ComplaintUpdate),
                            Message = $"Customer reported a problem with order #{dto.OrderId}. Payment is frozen pending resolution.",
                            RelatedEntityId = dto.OrderId,
                            RelatedEntityType = "Order",
                            DateCreated = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                    }
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

        // ================== REVIEWS ==================

        public async Task<int> CreateReviewAsync(int customerId, CreateReviewDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // ✅ SPAM PREVENTION: Comprehensive validation before allowing review
                var validation = await _reviewValidator.ValidateReviewAsync(
                    customerId, dto.ProductId, dto.OrderId);

                if (!validation.CanReview)
                {
                    throw new InvalidOperationException(validation.ReasonIfCannot ?? "Cannot post review at this time.");
                }

                // Create the review
                var review = new Review
                {
                    ProductId = dto.ProductId,
                    CustomerId = customerId,
                    OrderId = dto.OrderId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    DatePosted = DateTime.UtcNow,
                    IsApproved = true,
                    IsVerifiedPurchase = true
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Update seller rating
                var product = await _context.Products
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);

                if (product != null)
                {
                    await _ratingCalculator.UpdateSellerRatingAsync(product.SellerId);

                    // ✅ FIX: Notify seller about new review with timestamp
                    var notification = new Notification
                    {
                        UserId = product.Seller.UserId,
                        NotificationType = nameof(NotificationType.ReviewPosted),
                        Message = $"New {dto.Rating}-star review posted for {product.ProductName}",
                        DetailedMessage = dto.Comment,
                        RelatedEntityId = review.ReviewId,
                        RelatedEntityType = "Review",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return review.ReviewId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedResult<ReviewDto>> GetMyReviewsAsync(int customerId, PaginationParams paginationParams)
        {
            var query = _context.Reviews
                .Include(r => r.Product)
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.DatePosted);

            var pagedEntities = await query.ToPagedResultAsync(paginationParams);

            var dtoItems = pagedEntities.Items.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                ProductId = r.ProductId,
                ProductName = r.Product.ProductName,
                Rating = r.Rating,
                Comment = r.Comment,
                DatePosted = r.DatePosted,
                IsApproved = r.IsApproved,
                IsVerifiedPurchase = r.IsVerifiedPurchase
            }).ToList();

            return new PagedResult<ReviewDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        /// <summary>
        /// Validate if customer can post a review for a product
        /// </summary>
        public async Task<ReviewValidationResultDto> CanPostReviewAsync(
            int customerId, int productId, int orderId)
        {
            return await _reviewValidator.ValidateReviewAsync(customerId, productId, orderId);
        }

        /// <summary>
        /// Get current rate limit status for customer's reviews
        /// </summary>
        public async Task<ReviewRateLimitDto> GetReviewRateLimitAsync(int customerId)
        {
            return await _reviewValidator.CheckRateLimitAsync(customerId);
        }

        public async Task<bool> CanReviewProduct(int customerId, int productId, int orderId)
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.Order.CustomerId == customerId &&
                               oi.ProductId == productId &&
                               oi.OrderId == orderId &&
                               oi.Order.OrderStatus == nameof(OrderStatus.Completed));

            return orderItem;
        }

        // ================== SELLER FOLLOWING ==================

        public async Task<bool> FollowSellerAsync(int customerId, int sellerId)
        {
            var existingFollow = await _context.SellerFollowers
                .AnyAsync(sf => sf.CustomerId == customerId && sf.SellerId == sellerId);

            if (existingFollow) return false;

            var sellerFollower = new SellerFollower
            {
                CustomerId = customerId,
                SellerId = sellerId,
                DateFollowed = DateTime.UtcNow,
                NotificationsEnabled = true
            };

            _context.SellerFollowers.Add(sellerFollower);
            await _context.SaveChangesAsync();

            // ✅ FIX: Notify seller with timestamp
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller != null)
            {
                var notification = new Notification
                {
                    UserId = seller.UserId,
                    NotificationType = nameof(NotificationType.NewFollower),
                    Message = "You have a new follower!",
                    RelatedEntityId = customerId,
                    RelatedEntityType = "Customer",
                    DateCreated = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> UnfollowSellerAsync(int customerId, int sellerId)
        {
            var sellerFollower = await _context.SellerFollowers
                .FirstOrDefaultAsync(sf => sf.CustomerId == customerId && sf.SellerId == sellerId);

            if (sellerFollower == null) return false;

            _context.SellerFollowers.Remove(sellerFollower);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<FollowedSellerDto>> GetFollowedSellersAsync(int customerId, PaginationParams paginationParams)
        {
            var query = _context.SellerFollowers
                .Include(sf => sf.Seller)
                    .ThenInclude(s => s.Products)
                .Where(sf => sf.CustomerId == customerId)
                .OrderByDescending(sf => sf.DateFollowed);

            var pagedEntities = await query.ToPagedResultAsync(paginationParams);

            var dtoItems = pagedEntities.Items.Select(sf => new FollowedSellerDto
            {
                SellerId = sf.SellerId,
                ShopName = sf.Seller.ShopName,
                ShopLogo = sf.Seller.ShopLogo,
                ShopDescription = sf.Seller.ShopDescription,
                OverallRating = sf.Seller.OverallRating,
                TotalReviews = sf.Seller.TotalReviews,
                DateFollowed = sf.DateFollowed,
                NotificationsEnabled = sf.NotificationsEnabled,
                TotalProducts = sf.Seller.Products.Count(p => p.IsActive)
            }).ToList();

            return new PagedResult<FollowedSellerDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<PagedResult<FollowedSellerProductDto>> GetFollowedSellersProductsAsync(int customerId, PaginationParams paginationParams)
        {
            var followedSellerIds = await _context.SellerFollowers
                .Where(sf => sf.CustomerId == customerId)
                .Select(sf => sf.SellerId)
                .ToListAsync();

            var query = _context.Products
                .Include(p => p.Seller)
                .Where(p => followedSellerIds.Contains(p.SellerId) && p.IsActive)
                .OrderByDescending(p => p.DateListed);

            var pagedEntities = await query.ToPagedResultAsync(paginationParams);

            var dtoItems = pagedEntities.Items.Select(p => new FollowedSellerProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                DateListed = p.DateListed,
                SellerId = p.SellerId,
                SellerShopName = p.Seller.ShopName,
                SellerRating = p.Seller.OverallRating
            }).ToList();

            return new PagedResult<FollowedSellerProductDto>
            {
                Items = dtoItems,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
                TotalCount = pagedEntities.TotalCount
            };
        }

        public async Task<bool> IsFollowingSellerAsync(int customerId, int sellerId)
        {
            return await _context.SellerFollowers
                .AnyAsync(sf => sf.CustomerId == customerId && sf.SellerId == sellerId);
        }

        // ================== HELPER METHODS ==================

        private CustomerOrderDto MapToCustomerOrderDto(Order order)
        {
            return new CustomerOrderDto
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
                CustomerPhone = order.CustomerPhone,
                DeliveryDate = order.DeliveryDate,
                VerificationPeriodEnd = order.VerificationPeriodEnd,
                CustomerConfirmedReceipt = order.CustomerConfirmedReceipt,
                CustomerReportedProblem = order.CustomerReportedProblem,
                TotalItems = order.OrderItems.Sum(oi => oi.Quantity),
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
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
                }).ToList()
            };
        }

        private List<OrderStatusHistoryDto> BuildStatusHistory(Order order)
        {
            var history = new List<OrderStatusHistoryDto>();

            history.Add(new OrderStatusHistoryDto
            {
                Status = "Pending",
                Date = order.OrderDate,
                Description = "Order placed successfully"
            });

            if (order.OrderStatus == nameof(OrderStatus.Confirmed) ||
                order.OrderStatus == nameof(OrderStatus.PickedUp) ||
                order.OrderStatus == nameof(OrderStatus.OnTheWay) ||
                order.OrderStatus == nameof(OrderStatus.Delivered) ||
                order.OrderStatus == nameof(OrderStatus.Completed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "Confirmed",
                    Date = order.OrderDate.AddHours(1),
                    Description = "Order confirmed by seller"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.PickedUp) ||
                order.OrderStatus == nameof(OrderStatus.OnTheWay) ||
                order.OrderStatus == nameof(OrderStatus.Delivered) ||
                order.OrderStatus == nameof(OrderStatus.Completed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "PickedUp",
                    Date = order.OrderDate.AddHours(2),
                    Description = "Order picked up by delivery staff"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.OnTheWay) ||
                order.OrderStatus == nameof(OrderStatus.Delivered) ||
                order.OrderStatus == nameof(OrderStatus.Completed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "OnTheWay",
                    Date = order.OrderDate.AddHours(3),
                    Description = "Order is on the way"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.Delivered) ||
                order.OrderStatus == nameof(OrderStatus.Completed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "Delivered",
                    Date = order.DeliveryDate ?? order.OrderDate.AddDays(1),
                    Description = "Order delivered successfully"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.Completed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "Completed",
                    Date = order.DeliveryDate?.AddDays(1) ?? order.OrderDate.AddDays(2),
                    Description = "Order completed - Payment released"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.Cancelled))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "Cancelled",
                    Date = order.CancelledDate ?? DateTime.UtcNow,
                    Description = order.CancellationReason ?? "Order cancelled"
                });
            }

            if (order.OrderStatus == nameof(OrderStatus.Disputed))
            {
                history.Add(new OrderStatusHistoryDto
                {
                    Status = "Disputed",
                    Date = DateTime.UtcNow,
                    Description = "Order under dispute - Support team will contact you"
                });
            }

            return history;
        }

        private async Task<List<CustomerComplaintMessageDto>> BuildCustomerComplaintConversationAsync(
    Complaint complaint)
        {
            var conversation = new List<CustomerComplaintMessageDto>();

            try
            {
                // Load all non-internal messages
                var messages = await _context.Set<ComplaintMessage>()
                    .Where(m => m.ComplaintId == complaint.ComplaintId && !m.IsInternal)
                    .OrderBy(m => m.Timestamp)
                    .ToListAsync();

                foreach (var msg in messages)
                {
                    conversation.Add(new CustomerComplaintMessageDto
                    {
                        MessageId = msg.MessageId,
                        SenderType = msg.SenderType,
                        SenderName = msg.SenderName ?? "Unknown",
                        Message = msg.Message ?? "",
                        Timestamp = msg.Timestamp
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error building customer complaint conversation: {ex.Message}");
            }

            return conversation;
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

        // Complaint Related Methods Async With Support Staff

        public async Task<PagedResult<CustomerComplaintListDto>> GetMyComplaintsAsync( int customerId, CustomerComplaintFilterParams filterParams)
        {
            try
            {
                var query = _context.Complaints
                    .Include(c => c.AssignedSupportStaff)
                    .Where(c => c.CustomerId == customerId)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(filterParams.Status))
                {
                    query = query.Where(c => c.Status == filterParams.Status);
                }

                if (!string.IsNullOrEmpty(filterParams.ComplaintType))
                {
                    query = query.Where(c => c.ComplaintType == filterParams.ComplaintType);
                }

                if (filterParams.FromDate.HasValue)
                {
                    query = query.Where(c => c.DateReported >= filterParams.FromDate.Value);
                }

                if (filterParams.ToDate.HasValue)
                {
                    query = query.Where(c => c.DateReported <= filterParams.ToDate.Value);
                }

                // Apply sorting based on filterParams
                if (!string.IsNullOrEmpty(filterParams.SortBy))
                {
                    query = query.ApplySorting(filterParams.SortBy, filterParams.SortOrder);
                }
                else
                {
                    // Default: most recent first
                    query = query.OrderByDescending(c => c.DateReported);
                }

                // Get paged results
                var pagedEntities = await query.ToPagedResultAsync(filterParams);

                // Get complaint IDs for message counting
                var complaintIds = pagedEntities.Items.Select(c => c.ComplaintId).ToList();

                // Map to DTOs
                var dtoItems = new List<CustomerComplaintListDto>();
                foreach (var c in pagedEntities.Items)
                {
                    // Count unread messages (messages from staff/system after complaint creation)
                    var unreadCount = await _context.Set<ComplaintMessage>()
                        .CountAsync(m => m.ComplaintId == c.ComplaintId &&
                                        !m.IsInternal &&
                                        m.SenderType != "Customer");

                    dtoItems.Add(new CustomerComplaintListDto
                    {
                        ComplaintId = c.ComplaintId,
                        OrderId = c.OrderId,
                        ComplaintType = c.ComplaintType,
                        Status = c.Status,
                        Priority = c.Priority ?? "Medium",
                        DateReported = c.DateReported,
                        ResolvedDate = c.ResolvedDate,
                        IsAssigned = c.AssignedSupportStaffId.HasValue,
                        AssignedStaffName = c.AssignedSupportStaff?.FullName,
                        ShortDescription = c.Description != null && c.Description.Length > 100
                            ? c.Description.Substring(0, 100) + "..."
                            : c.Description ?? "",
                        UnreadMessagesCount = unreadCount
                    });
                }

                return new PagedResult<CustomerComplaintListDto>
                {
                    Items = dtoItems,
                    PageNumber = pagedEntities.PageNumber,
                    PageSize = pagedEntities.PageSize,
                    TotalCount = pagedEntities.TotalCount
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMyComplaintsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<CustomerComplaintDetailDto?> GetComplaintDetailsAsync(
    int customerId,
    int complaintId)
        {
            try
            {
                var complaint = await _context.Complaints
                    .Include(c => c.AssignedSupportStaff)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Product)
                    .Include(c => c.Order)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Seller)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(c => c.ComplaintId == complaintId && c.CustomerId == customerId);

                if (complaint == null) return null;

                // Build conversation thread (excluding internal messages)
                var conversation = await BuildCustomerComplaintConversationAsync(complaint);

                // Determine if customer can reply
                bool canReply = complaint.Status != nameof(ComplaintStatus.Closed) &&
                               complaint.Status != nameof(ComplaintStatus.Resolved);

                return new CustomerComplaintDetailDto
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
                    IsAssigned = complaint.AssignedSupportStaffId.HasValue,
                    AssignedStaffName = complaint.AssignedSupportStaff?.FullName,
                    Order = complaint.Order != null ? new CustomerComplaintOrderDto
                    {
                        OrderId = complaint.Order.OrderId,
                        OrderDate = complaint.Order.OrderDate,
                        GrandTotal = complaint.Order.GrandTotal,
                        OrderStatus = complaint.Order.OrderStatus,
                        OrderItems = complaint.Order.OrderItems?
                            .Where(oi => oi.Product != null && oi.Seller != null)
                            .Select(oi => new CustomerComplaintOrderItemDto
                            {
                                OrderItemId = oi.OrderItemId,
                                ProductName = oi.ProductName ?? "",
                                ProductImage = oi.ProductImage,
                                Quantity = oi.Quantity,
                                UnitPrice = oi.UnitPrice,
                                Subtotal = oi.Subtotal,
                                SellerShopName = oi.Seller?.ShopName ?? ""
                            }).ToList() ?? new List<CustomerComplaintOrderItemDto>()
                    } : new CustomerComplaintOrderDto
                    {
                        OrderId = complaint.OrderId,
                        OrderDate = DateTime.MinValue,
                        GrandTotal = 0,
                        OrderStatus = "Unknown"
                    },
                    Conversation = conversation,
                    CanReply = canReply
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetComplaintDetailsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<int> CreateComplaintAsync(int customerId, CreateComplaintDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate order belongs to customer
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId && o.CustomerId == customerId);

                if (order == null)
                {
                    throw new InvalidOperationException("Order not found or does not belong to you.");
                }

                // Check if complaint already exists for this order
                var existingComplaint = await _context.Complaints
                    .AnyAsync(c => c.OrderId == dto.OrderId && c.CustomerId == customerId);

                if (existingComplaint)
                {
                    throw new InvalidOperationException(
                        "A complaint already exists for this order. Please check your complaints list.");
                }

                // Validate complaint type
                var validComplaintTypes = new[]
                {
            nameof(ComplaintType.ProductQuality),
            nameof(ComplaintType.PaymentDispute),
            nameof(ComplaintType.DeliveryIssue),
            nameof(ComplaintType.SellerIssue),
            nameof(ComplaintType.RefundRequest),
            nameof(ComplaintType.Other)
        };

                if (!validComplaintTypes.Contains(dto.ComplaintType))
                {
                    throw new InvalidOperationException("Invalid complaint type.");
                }

                // Create complaint
                var complaint = new Complaint
                {
                    OrderId = dto.OrderId,
                    CustomerId = customerId,
                    ComplaintType = dto.ComplaintType,
                    Description = dto.Description,
                    Status = nameof(ComplaintStatus.Open),
                    Priority = "Medium",
                    DateReported = DateTime.UtcNow,
                    AttachedImages = dto.AttachedImages
                };

                _context.Complaints.Add(complaint);
                await _context.SaveChangesAsync();

                // Add initial system message
                var systemMessage = new ComplaintMessage
                {
                    ComplaintId = complaint.ComplaintId,
                    SenderType = "System",
                    SenderName = "Support System",
                    Message = "Your complaint has been registered. Our support team will review it shortly.",
                    Timestamp = DateTime.UtcNow,
                    IsInternal = false
                };
                _context.Set<ComplaintMessage>().Add(systemMessage);

                // Add auto-response based on complaint type
                var autoResponse = GetAutoResponseMessage(dto.ComplaintType);
                if (!string.IsNullOrEmpty(autoResponse))
                {
                    var autoMessage = new ComplaintMessage
                    {
                        ComplaintId = complaint.ComplaintId,
                        SenderType = "System",
                        SenderName = "Support Bot",
                        Message = autoResponse,
                        Timestamp = DateTime.UtcNow.AddSeconds(1),
                        IsInternal = false
                    };
                    _context.Set<ComplaintMessage>().Add(autoMessage);
                }

                // Notify support staff (create notifications for all active support staff)
                var supportStaff = await _context.SupportStaffs
                    .Where(s => s.IsActive)
                    .ToListAsync();

                foreach (var staff in supportStaff)
                {
                    var notification = new Notification
                    {
                        UserId = staff.UserId,
                        NotificationType = nameof(NotificationType.ComplaintUpdate),
                        Message = $"New complaint #{complaint.ComplaintId} filed for Order #{dto.OrderId}",
                        DetailedMessage = $"Type: {dto.ComplaintType}. Description: {dto.Description.Substring(0, Math.Min(100, dto.Description.Length))}...",
                        RelatedEntityId = complaint.ComplaintId,
                        RelatedEntityType = "Complaint",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return complaint.ComplaintId;
            }
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException(
                    "An error occurred while creating the complaint. Please try again.", ex);
            }
        }

        public async Task<bool> ReplyToComplaintAsync(int customerId, ReplyToComplaintDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate complaint belongs to customer
                var complaint = await _context.Complaints
                    .Include(c => c.AssignedSupportStaff)
                    .Include(c => c.Customer)
                    .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId && c.CustomerId == customerId);

                if (complaint == null)
                {
                    throw new InvalidOperationException("Complaint not found or does not belong to you.");
                }

                // Check if complaint is closed or resolved
                if (complaint.Status == nameof(ComplaintStatus.Closed))
                {
                    throw new InvalidOperationException(
                        "Cannot reply to a closed complaint. Please create a new complaint if you have additional issues.");
                }

                if (complaint.Status == nameof(ComplaintStatus.Resolved))
                {
                    throw new InvalidOperationException(
                        "This complaint has been resolved. If you're not satisfied, please contact support directly.");
                }

                // Create message
                var message = new ComplaintMessage
                {
                    ComplaintId = dto.ComplaintId,
                    SenderType = "Customer",
                    SenderName = complaint.Customer.FullName ?? "Customer",
                    Message = dto.Message,
                    Timestamp = DateTime.UtcNow,
                    IsInternal = false
                };

                _context.Set<ComplaintMessage>().Add(message);

                // Update complaint status if it was Open
                if (complaint.Status == nameof(ComplaintStatus.Open))
                {
                    complaint.Status = nameof(ComplaintStatus.InProgress);
                }

                // Notify assigned support staff
                if (complaint.AssignedSupportStaffId.HasValue && complaint.AssignedSupportStaff?.UserId != null)
                {
                    var notification = new Notification
                    {
                        UserId = complaint.AssignedSupportStaff.UserId,
                        NotificationType = nameof(NotificationType.ComplaintUpdate),
                        Message = $"Customer replied to complaint #{complaint.ComplaintId}",
                        DetailedMessage = dto.Message.Length > 100
                            ? dto.Message.Substring(0, 100) + "..."
                            : dto.Message,
                        RelatedEntityId = complaint.ComplaintId,
                        RelatedEntityType = "Complaint",
                        DateCreated = DateTime.UtcNow,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }
                else
                {
                    // If not assigned, notify all active support staff
                    var supportStaff = await _context.SupportStaffs
                        .Where(s => s.IsActive)
                        .ToListAsync();

                    foreach (var staff in supportStaff)
                    {
                        var notification = new Notification
                        {
                            UserId = staff.UserId,
                            NotificationType = nameof(NotificationType.ComplaintUpdate),
                            Message = $"Customer replied to unassigned complaint #{complaint.ComplaintId}",
                            DetailedMessage = dto.Message.Length > 100
                                ? dto.Message.Substring(0, 100) + "..."
                                : dto.Message,
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
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException(
                    "An error occurred while sending your reply. Please try again.", ex);
            }
        }
    }
}