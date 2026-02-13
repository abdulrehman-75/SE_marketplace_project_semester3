using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Customer;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "CustomerOnly")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly IOwnershipHelper _ownershipHelper;

        public CustomerController(ICustomerService customerService, IOwnershipHelper ownershipHelper)
        {
            _customerService = customerService;
            _ownershipHelper = ownershipHelper;
        }

        // ================== PROFILE MANAGEMENT ==================

        /// <summary>
        /// Get customer profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer profile not found"));

            var profile = await _customerService.GetProfileAsync(customerId.Value);
            if (profile == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Profile not found"));

            return Ok(ApiResponse<CustomerProfileDto>.SuccessResponse(profile, "Profile retrieved successfully"));
        }

        /// <summary>
        /// Update customer profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer profile not found"));

            var result = await _customerService.UpdateProfileAsync(customerId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update profile"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Profile updated successfully"));
        }

        // ================== PRODUCT BROWSING ==================

        /// <summary>
        /// Get all products with filtering and pagination
        /// </summary>
        [HttpGet("products")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProducts([FromQuery] ProductFilterParams filterParams)
        {
            var products = await _customerService.GetAllProductsAsync(filterParams);
            return Ok(ApiResponse<PagedResult<ProductListDto>>.SuccessResponse(products, "Products retrieved successfully"));
        }

        /// <summary>
        /// Get product details
        /// </summary>
        [HttpGet("products/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductDetail(int productId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            int? customerId = null;

            if (userId != null)
            {
                customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            }

            var product = await _customerService.GetProductDetailAsync(productId, customerId);
            if (product == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Product not found"));

            return Ok(ApiResponse<ProductDetailDto>.SuccessResponse(product, "Product details retrieved successfully"));
        }

        /// <summary>
        /// Search products
        /// </summary>
        [HttpGet("products/search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchProducts([FromQuery] string searchTerm, [FromQuery] ProductFilterParams filterParams)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(ApiResponse<object>.ErrorResponse("Search term is required"));

            var products = await _customerService.SearchProductsAsync(searchTerm, filterParams);
            return Ok(ApiResponse<PagedResult<ProductListDto>>.SuccessResponse(products, "Search results retrieved successfully"));
        }

        // ================== CART MANAGEMENT ==================

        /// <summary>
        /// Get customer's cart
        /// </summary>
        [HttpGet("cart")]
        public async Task<IActionResult> GetCart()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var cart = await _customerService.GetCartAsync(customerId.Value);
            return Ok(ApiResponse<CartDto>.SuccessResponse(cart!, "Cart retrieved successfully"));
        }

        /// <summary>
        /// Add product to cart
        /// </summary>
        [HttpPost("cart/add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            try
            {
                var result = await _customerService.AddToCartAsync(customerId.Value, dto);
                if (!result)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Failed to add to cart. Product may be out of stock."));

                return Ok(ApiResponse<string>.SuccessResponse(null!, "Product added to cart successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Update cart item quantity
        /// </summary>
        [HttpPut("cart/items/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            try
            {
                var result = await _customerService.UpdateCartItemAsync(customerId.Value, cartItemId, dto);
                if (!result)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update cart item. Check stock availability."));

                return Ok(ApiResponse<string>.SuccessResponse(null!, "Cart item updated successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Remove item from cart
        /// </summary>
        [HttpDelete("cart/items/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.RemoveFromCartAsync(customerId.Value, cartItemId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to remove item from cart"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Item removed from cart successfully"));
        }

        /// <summary>
        /// Clear entire cart
        /// </summary>
        [HttpDelete("cart/clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.ClearCartAsync(customerId.Value);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to clear cart"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Cart cleared successfully"));
        }

        // ================== ORDER MANAGEMENT ==================

        /// <summary>
        /// Create order from cart (Place Order)
        /// </summary>
        [HttpPost("orders")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            // ✅ NEW: Validate cart is not empty BEFORE attempting order creation
            var cart = await _customerService.GetCartAsync(customerId.Value);

            if (cart == null || !cart.Items.Any())
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Cannot create order from empty cart. Please add items to your cart first."));
            }

            // ✅ NEW: Additional validations
            // Check if all cart items are still active and in stock
            var inactiveOrOutOfStockItems = cart.Items
                .Where(item => !item.IsActive || item.StockQuantity < item.Quantity)
                .ToList();

            if (inactiveOrOutOfStockItems.Any())
            {
                var itemNames = string.Join(", ", inactiveOrOutOfStockItems.Select(i => i.ProductName));
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    $"Some items in your cart are no longer available or out of stock: {itemNames}. Please update your cart."));
            }

            try
            {
                var orderId = await _customerService.CreateOrderAsync(customerId.Value, dto);
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { OrderId = orderId },
                    "Order placed successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    $"An error occurred while processing your order. Please try again. Details: {ex}"));
            }
        }

        /// <summary>
        /// Get order history
        /// </summary>
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrderHistory([FromQuery] OrderFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var orders = await _customerService.GetOrderHistoryAsync(customerId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<CustomerOrderDto>>.SuccessResponse(orders, "Order history retrieved successfully"));
        }

        /// <summary>
        /// Get order details
        /// </summary>
        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var order = await _customerService.GetOrderDetailsAsync(customerId.Value, orderId);
            if (order == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Order not found"));

            return Ok(ApiResponse<CustomerOrderDto>.SuccessResponse(order, "Order details retrieved successfully"));
        }

        /// <summary>
        /// Track order status
        /// </summary>
        [HttpGet("orders/{orderId}/track")]
        public async Task<IActionResult> TrackOrder(int orderId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var tracking = await _customerService.TrackOrderAsync(customerId.Value, orderId);
            if (tracking == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Order not found"));

            return Ok(ApiResponse<OrderTrackingDto>.SuccessResponse(tracking, "Order tracking retrieved successfully"));
        }

        // Add this endpoint to your CustomerController.cs in the ORDER MANAGEMENT section
        // Place it after the TrackOrder endpoint

        /// <summary>
        /// Cancel order (only allowed when status is Pending - before seller confirms)
        /// Restores product stock and notifies sellers
        /// </summary>
        /// <param name="orderId">The ID of the order to cancel</param>
        /// <param name="dto">Cancellation details including reason</param>
        /// <returns>Cancellation confirmation with refund details</returns>
        [HttpPost("orders/{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId, [FromBody] CancelOrderDto dto)
        {
            // 1. VALIDATE REQUEST
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Invalid cancellation data",
                    ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList()));
            }

            // 2. AUTHENTICATE USER
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized access"));
            }

            // 3. GET CUSTOMER ID
            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Customer profile not found"));
            }

            // 4. VERIFY ORDER OWNERSHIP (additional security check)
            var isOwner = await _ownershipHelper.IsOrderOwnerAsync(orderId, customerId.Value);
            if (!isOwner)
            {
                return Forbid(); // 403 Forbidden - order exists but doesn't belong to this customer
            }

            // 5. ATTEMPT CANCELLATION
            try
            {
                var result = await _customerService.CancelOrderAsync(
                    customerId.Value,
                    orderId,
                    dto);

                return Ok(ApiResponse<CancelOrderResponseDto>.SuccessResponse(
                    result,
                    "Order cancelled successfully. Stock has been restored and sellers have been notified."));
            }
            catch (InvalidOperationException ex)
            {
                // Business logic errors (e.g., wrong status, already cancelled)
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                // Unexpected errors
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An unexpected error occurred while cancelling the order. Please try again or contact support.",
                    new List<string> { ex.Message }));
            }
        }

        // ================== ORDER VERIFICATION ==================

        /// <summary>
        /// Confirm receipt of order (releases payment to seller)
        /// </summary>
        [HttpPost("orders/confirm-receipt")]
        public async Task<IActionResult> ConfirmReceipt([FromBody] ConfirmReceiptDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.ConfirmReceiptAsync(customerId.Value, dto.OrderId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to confirm receipt. Order may not be eligible for confirmation."));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Receipt confirmed successfully. Payment has been released to seller."));
        }

        /// <summary>
        /// Report problem with order (freezes payment)
        /// </summary>
        [HttpPost("orders/report-problem")]
        public async Task<IActionResult> ReportProblem([FromBody] ReportProblemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.ReportProblemAsync(customerId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to report problem. Order may not be eligible."));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Problem reported successfully. Support team will contact you soon."));
        }

        // File: Controllers/CustomerController.cs
        // REPLACE your entire "REVIEWS" section with this:

        // ================== REVIEWS ==================

        /// <summary>
        /// Check if customer can post a review for a product (validation before form submission)
        /// </summary>
        [HttpGet("reviews/can-post")]
        public async Task<IActionResult> CanPostReview(
            [FromQuery] int productId,
            [FromQuery] int orderId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var validation = await _customerService.CanPostReviewAsync(customerId.Value, productId, orderId);

            if (!validation.CanReview)
            {
                return Ok(ApiResponse<ReviewValidationResultDto>.SuccessResponse(
                    validation,
                    "Review validation completed"));
            }

            return Ok(ApiResponse<ReviewValidationResultDto>.SuccessResponse(
                validation,
                $"You can post a review. {validation.DailyReviewsRemaining} reviews remaining today."));
        }

        /// <summary>
        /// Get review rate limit status for current customer
        /// </summary>
        [HttpGet("reviews/rate-limit")]
        public async Task<IActionResult> GetReviewRateLimit()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var rateLimit = await _customerService.GetReviewRateLimitAsync(customerId.Value);

            return Ok(ApiResponse<ReviewRateLimitDto>.SuccessResponse(
                rateLimit,
                rateLimit.IsLimited
                    ? "Daily review limit reached"
                    : $"{rateLimit.ReviewsRemaining} reviews remaining today"));
        }

        /// <summary>
        /// Create product review (with spam prevention)
        /// </summary>
        [HttpPost("reviews")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            try
            {
                // ✅ SPAM PREVENTION: Pre-validation happens in service layer
                var reviewId = await _customerService.CreateReviewAsync(customerId.Value, dto);

                // Get updated rate limit info
                var rateLimit = await _customerService.GetReviewRateLimitAsync(customerId.Value);

                return Ok(ApiResponse<object>.SuccessResponse(
                    new
                    {
                        ReviewId = reviewId,
                        ReviewsRemainingToday = rateLimit.ReviewsRemaining
                    },
                    $"Review posted successfully. You have {rateLimit.ReviewsRemaining} reviews remaining today."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Get customer's reviews
        /// </summary>
        [HttpGet("reviews")]
        public async Task<IActionResult> GetMyReviews([FromQuery] PaginationParams paginationParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var reviews = await _customerService.GetMyReviewsAsync(customerId.Value, paginationParams);
            return Ok(ApiResponse<PagedResult<ReviewDto>>.SuccessResponse(reviews, "Reviews retrieved successfully"));
        }

        // ================== SELLER FOLLOWING ==================

        /// <summary>
        /// Follow a seller
        /// </summary>
        [HttpPost("follow")]
        public async Task<IActionResult> FollowSeller([FromBody] FollowSellerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.FollowSellerAsync(customerId.Value, dto.SellerId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Already following this seller or seller not found"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Seller followed successfully"));
        }

        /// <summary>
        /// Unfollow a seller
        /// </summary>
        [HttpDelete("follow/{sellerId}")]
        public async Task<IActionResult> UnfollowSeller(int sellerId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var result = await _customerService.UnfollowSellerAsync(customerId.Value, sellerId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Not following this seller"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Seller unfollowed successfully"));
        }

        /// <summary>
        /// Get followed sellers
        /// </summary>
        [HttpGet("followed-sellers")]
        public async Task<IActionResult> GetFollowedSellers([FromQuery] PaginationParams paginationParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var sellers = await _customerService.GetFollowedSellersAsync(customerId.Value, paginationParams);
            return Ok(ApiResponse<PagedResult<FollowedSellerDto>>.SuccessResponse(sellers, "Followed sellers retrieved successfully"));
        }

        /// <summary>
        /// Get products from followed sellers
        /// </summary>
        [HttpGet("followed-sellers/products")]
        public async Task<IActionResult> GetFollowedSellersProducts([FromQuery] PaginationParams paginationParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var products = await _customerService.GetFollowedSellersProductsAsync(customerId.Value, paginationParams);
            return Ok(ApiResponse<PagedResult<FollowedSellerProductDto>>.SuccessResponse(products, "Products from followed sellers retrieved successfully"));
        }

        /// <summary>
        /// Check if following a seller
        /// </summary>
        [HttpGet("follow/check/{sellerId}")]
        public async Task<IActionResult> IsFollowingSeller(int sellerId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var isFollowing = await _customerService.IsFollowingSellerAsync(customerId.Value, sellerId);
            return Ok(ApiResponse<object>.SuccessResponse(new { IsFollowing = isFollowing }, "Follow status retrieved"));
        }


        // ================== COMPLAINT MANAGEMENT ==================

        /// <summary>
        /// Get all complaints filed by customer
        /// </summary>
        [HttpGet("complaints")]
        public async Task<IActionResult> GetMyComplaints([FromQuery] CustomerComplaintFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var complaints = await _customerService.GetMyComplaintsAsync(customerId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<CustomerComplaintListDto>>.SuccessResponse(
                complaints,
                "Complaints retrieved successfully"));
        }

        /// <summary>
        /// Get detailed view of a specific complaint with conversation thread
        /// </summary>
        [HttpGet("complaints/{complaintId}")]
        public async Task<IActionResult> GetComplaintDetails(int complaintId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var complaint = await _customerService.GetComplaintDetailsAsync(customerId.Value, complaintId);
            if (complaint == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Complaint not found or does not belong to you"));

            return Ok(ApiResponse<CustomerComplaintDetailDto>.SuccessResponse(
                complaint,
                "Complaint details retrieved successfully"));
        }

        /// <summary>
        /// Create a new complaint for an order
        /// </summary>
        [HttpPost("complaints")]
        public async Task<IActionResult> CreateComplaint([FromBody] CreateComplaintDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            try
            {
                var complaintId = await _customerService.CreateComplaintAsync(customerId.Value, dto);
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { ComplaintId = complaintId },
                    "Complaint created successfully. Our support team will review it shortly."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Reply to an existing complaint
        /// </summary>
        [HttpPost("complaints/{complaintId}/reply")]
        public async Task<IActionResult> ReplyToComplaint(int complaintId, [FromBody] ReplyToComplaintDto dto)
        {
            // Ensure complaintId in route matches the one in body
            if (dto.ComplaintId != complaintId)
                return BadRequest(ApiResponse<object>.ErrorResponse("Complaint ID mismatch"));

            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var customerId = await _ownershipHelper.GetCustomerIdAsync(userId);
            if (!customerId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            try
            {
                var result = await _customerService.ReplyToComplaintAsync(customerId.Value, dto);
                if (!result)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Failed to send reply"));

                return Ok(ApiResponse<string>.SuccessResponse(
                    null!,
                    "Reply sent successfully. Support team has been notified."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }
    }
}