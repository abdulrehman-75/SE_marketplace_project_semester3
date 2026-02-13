using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Seller;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SellerOnly")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;
        private readonly IOwnershipHelper _ownershipHelper;

        public SellerController(ISellerService sellerService, IOwnershipHelper ownershipHelper)
        {
            _sellerService = sellerService;
            _ownershipHelper = ownershipHelper;
        }

        // ============================================
        // PROFILE & DASHBOARD
        // ============================================

        /// <summary>
        /// Get seller's profile information
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetMyProfileAsync(sellerId.Value);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get seller dashboard statistics and recent activity
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetDashboardStatsAsync(sellerId.Value);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // SHOP LOGO MANAGEMENT
        // ============================================

        /// <summary>
        /// Upload or update shop logo
        /// </summary>
        [HttpPost("logo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadShopLogo(IFormFile logo)
        {
            if (logo == null || logo.Length == 0)
                return BadRequest(new { message = "No logo file provided" });

            if (logo.Length > 5 * 1024 * 1024) // 5MB
                return BadRequest(ApiResponse<object>.ErrorResponse("Image size must be less than 5MB"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.UploadShopLogoAsync(sellerId.Value, logo);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete shop logo
        /// </summary>
        [HttpDelete("logo")]
        public async Task<IActionResult> DeleteShopLogo()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.DeleteShopLogoAsync(sellerId.Value);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PRODUCT MANAGEMENT
        // ============================================

        /// <summary>
        /// Create a new product (without image - upload image separately)
        /// </summary>
        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.CreateProductAsync(sellerId.Value, dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetProductById), new { id = result.Data!.ProductId }, result);
        }

        /// <summary>
        /// Update existing product
        /// </summary>
        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.UpdateProductAsync(sellerId.Value, id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete product
        /// </summary>
        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.DeleteProductAsync(sellerId.Value, id);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Update product stock quantity and active status
        /// </summary>
        [HttpPatch("products/{id}/stock")]
        public async Task<IActionResult> UpdateProductStock(int id, [FromBody] UpdateProductStockDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.UpdateProductStockAsync(sellerId.Value, id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetProductByIdAsync(sellerId.Value, id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Get all products for the seller with filtering and pagination
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> GetMyProducts([FromQuery] ProductFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetMyProductsAsync(sellerId.Value, filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PRODUCT IMAGE MANAGEMENT
        // ============================================

        /// <summary>
        /// Upload or update product image
        /// </summary>
        [HttpPost("products/{id}/image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductImage(int id, IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest(new { message = "No image file provided" });

            //if (image.Length > 5 * 1024 * 1024) // 5MB
            //    return BadRequest(ApiResponse<object>.ErrorResponse("Image size must be less than 5MB"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.UploadProductImageAsync(sellerId.Value, id, image);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete product image
        /// </summary>
        [HttpDelete("products/{id}/image")]
        public async Task<IActionResult> DeleteProductImage(int id)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.DeleteProductImageAsync(sellerId.Value, id);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // ORDER MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all orders containing seller's products with filtering and pagination
        /// </summary>
        [HttpGet("orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] OrderFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetMyOrdersAsync(sellerId.Value, filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get detailed information about a specific order
        /// </summary>
        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetOrderDetailsAsync(sellerId.Value, id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // 🔧 BUG FIX: Order Confirmation Endpoint
        /// <summary>
        /// Confirm order (change status from Pending to Confirmed)
        /// </summary>
        [HttpPost("orders/{orderId}/confirm")]
        public async Task<IActionResult> ConfirmOrder(int orderId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.ConfirmOrderAsync(sellerId.Value, orderId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PAYMENT VERIFICATION
        // ============================================

        /// <summary>
        /// Get all payment verifications for the seller
        /// </summary>
        [HttpGet("payments")]
        public async Task<IActionResult> GetMyPaymentVerifications([FromQuery] PaginationParams paginationParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetMyPaymentVerificationsAsync(sellerId.Value, paginationParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get details of a specific payment verification
        /// </summary>
        [HttpGet("payments/{id}")]
        public async Task<IActionResult> GetPaymentVerificationDetails(int id)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetPaymentVerificationDetailsAsync(sellerId.Value, id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ============================================
        // FOLLOWERS
        // ============================================

        /// <summary>
        /// Get all customers who follow the seller's shop
        /// </summary>
        [HttpGet("followers")]
        public async Task<IActionResult> GetMyFollowers([FromQuery] PaginationParams paginationParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var sellerId = await _ownershipHelper.GetSellerIdAsync(userId);
            if (sellerId == null)
                return NotFound(new { message = "Seller profile not found" });

            var result = await _sellerService.GetMyFollowersAsync(sellerId.Value, paginationParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // CATEGORIES
        // ============================================

        /// <summary>
        /// Get all active categories for product creation/editing
        /// </summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetActiveCategories()
        {
            var result = await _sellerService.GetActiveCategoriesAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}