using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Admin.MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IOwnershipHelper _ownershipHelper;

        public AdminController(IAdminService adminService, IOwnershipHelper ownershipHelper)
        {
            _adminService = adminService;
            _ownershipHelper = ownershipHelper;
        }

        // ============================================
        // PROFILE & DASHBOARD
        // ============================================

        /// <summary>
        /// Get admin's profile information
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var adminId = await GetAdminIdAsync(userId);
            if (adminId == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Admin profile not found"));

            var result = await _adminService.GetMyProfileAsync(adminId.Value);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get comprehensive admin dashboard with platform statistics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _adminService.GetDashboardStatsAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // SELLER MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all sellers with filtering and pagination
        /// </summary>
        [HttpGet("sellers")]
        public async Task<IActionResult> GetAllSellers([FromQuery] SellerFilterParams filterParams)
        {
            var result = await _adminService.GetAllSellersAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get detailed information about a specific seller
        /// </summary>
        [HttpGet("sellers/{id}")]
        public async Task<IActionResult> GetSellerDetails(int id)
        {
            var result = await _adminService.GetSellerDetailsAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Create a new seller account
        /// </summary>
        [HttpPost("sellers")]
        public async Task<IActionResult> CreateSeller([FromBody] CreateSellerByAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateSellerAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetSellerDetails), new { id = result.Data }, result);
        }

        /// <summary>
        /// Update seller verification/active status
        /// </summary>
        [HttpPatch("sellers/status")]
        public async Task<IActionResult> UpdateSellerStatus([FromBody] UpdateSellerStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.UpdateSellerStatusAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a seller account
        /// </summary>
        [HttpDelete("sellers/{id}")]
        public async Task<IActionResult> DeleteSeller(int id)
        {
            var result = await _adminService.DeleteSellerAsync(id);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // CUSTOMER MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all customers with filtering and pagination
        /// </summary>
        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers([FromQuery] CustomerFilterParams filterParams)
        {
            var result = await _adminService.GetAllCustomersAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get detailed information about a specific customer
        /// </summary>
        [HttpGet("customers/{id}")]
        public async Task<IActionResult> GetCustomerDetails(int id)
        {
            var result = await _adminService.GetCustomerDetailsAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ============================================
        // ORDER MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all orders in the system with filtering and pagination
        /// </summary>
        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders([FromQuery] OrderFilterParams filterParams)
        {
            var result = await _adminService.GetAllOrdersAsync(filterParams);

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
            var result = await _adminService.GetOrderDetailsAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// Admin force-confirm order (override seller confirmation requirements)
        /// Use cases: Emergency situations, unresponsive sellers, dispute resolution, testing
        /// </summary>
        /// <param name="orderId">Order to confirm</param>
        /// <param name="dto">Confirmation details including reason for intervention</param>
        [HttpPost("orders/{orderId}/confirm")]
        public async Task<IActionResult> AdminConfirmOrder(int orderId, [FromBody] AdminConfirmOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var adminId = await GetAdminIdAsync(userId);
            if (adminId == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Admin profile not found"));

            var result = await _adminService.AdminConfirmOrderAsync(adminId.Value, orderId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PAYMENT VERIFICATION MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all payment verifications with filtering
        /// </summary>
        [HttpGet("payments")]
        public async Task<IActionResult> GetAllPaymentVerifications([FromQuery] PaymentVerificationFilterParams filterParams)
        {
            var result = await _adminService.GetAllPaymentVerificationsAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get detailed information about a specific payment verification
        /// </summary>
        [HttpGet("payments/{id}")]
        public async Task<IActionResult> GetPaymentVerificationDetails(int id)
        {
            var result = await _adminService.GetPaymentVerificationDetailsAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Manually release, hold, or dispute a payment
        /// </summary>
        [HttpPost("payments/manual-action")]
        public async Task<IActionResult> ManualPaymentAction([FromBody] ManualPaymentActionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var adminId = await GetAdminIdAsync(userId);
            if (adminId == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Admin profile not found"));

            var result = await _adminService.ManualPaymentActionAsync(adminId.Value, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // CATEGORY MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all categories with statistics
        /// </summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var result = await _adminService.GetAllCategoriesAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var result = await _adminService.GetCategoryByIdAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateCategoryAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetCategoryById), new { id = result.Data }, result);
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        [HttpPut("categories")]
        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.UpdateCategoryAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a category
        /// </summary>
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var result = await _adminService.DeleteCategoryAsync(id);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Upload category image
        /// </summary>
        [HttpPost("categories/{id}/image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadCategoryImage(int id, IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("No image file provided"));
            if (image.Length > 5 * 1024 * 1024) // 5MB
                return BadRequest(ApiResponse<object>.ErrorResponse("Image size must be less than 5MB"));

            var result = await _adminService.UploadCategoryImageAsync(id, image);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PRODUCT MODERATION
        // ============================================

        /// <summary>
        /// Get all products in the system with filtering
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts([FromQuery] ProductFilterParams filterParams)
        {
            var result = await _adminService.GetAllProductsAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Activate or deactivate a product
        /// </summary>
        [HttpPatch("products/status")]
        public async Task<IActionResult> UpdateProductStatus([FromBody] UpdateProductStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.UpdateProductStatusAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // REVIEW MODERATION
        // ============================================

        /// <summary>
        /// Get all reviews for moderation
        /// </summary>
        [HttpGet("reviews")]
        public async Task<IActionResult> GetAllReviews([FromQuery] PaginationParams paginationParams)
        {
            var result = await _adminService.GetAllReviewsAsync(paginationParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Approve or reject a review
        /// </summary>
        [HttpPost("reviews/moderate")]
        public async Task<IActionResult> ModerateReview([FromBody] ModerateReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.ModerateReviewAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // STAFF MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all delivery staff
        /// </summary>
        [HttpGet("staff/delivery")]
        public async Task<IActionResult> GetAllDeliveryStaff()
        {
            var result = await _adminService.GetAllDeliveryStaffAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Create new delivery staff
        /// </summary>
        [HttpPost("staff/delivery")]
        public async Task<IActionResult> CreateDeliveryStaff([FromBody] CreateDeliveryStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateDeliveryStaffAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetAllDeliveryStaff), result);
        }

        /// <summary>
        /// Get all support staff
        /// </summary>
        [HttpGet("staff/support")]
        public async Task<IActionResult> GetAllSupportStaff()
        {
            var result = await _adminService.GetAllSupportStaffAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Create new support staff
        /// </summary>
        [HttpPost("staff/support")]
        public async Task<IActionResult> CreateSupportStaff([FromBody] CreateSupportStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateSupportStaffAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetAllSupportStaff), result);
        }

        /// <summary>
        /// Get all inventory managers
        /// </summary>
        [HttpGet("staff/inventory")]
        public async Task<IActionResult> GetAllInventoryManagers()
        {
            var result = await _adminService.GetAllInventoryManagersAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Create new inventory manager
        /// </summary>
        [HttpPost("staff/inventory")]
        public async Task<IActionResult> CreateInventoryManager([FromBody] CreateInventoryManagerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateInventoryManagerAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetAllInventoryManagers), result);
        }

        /// <summary>
        /// Update staff status (activate/deactivate)
        /// </summary>
        [HttpPatch("staff/{staffType}/{staffId}/status")]
        public async Task<IActionResult> UpdateStaffStatus(string staffType, int staffId, [FromBody] bool isActive)
        {
            var result = await _adminService.UpdateStaffStatusAsync(staffType, staffId, isActive);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // COMPLAINT OVERSIGHT
        // ============================================

        /// <summary>
        /// Get all complaints in the system
        /// </summary>
        [HttpGet("complaints")]
        public async Task<IActionResult> GetAllComplaints([FromQuery] PaginationParams paginationParams)
        {
            var result = await _adminService.GetAllComplaintsAsync(paginationParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // SALES REPORTS
        // ============================================

        /// <summary>
        /// Generate comprehensive sales report
        /// </summary>
        [HttpPost("reports/sales")]
        public async Task<IActionResult> GenerateSalesReport([FromBody] SalesReportFilterDto filterDto)
        {
            var result = await _adminService.GenerateSalesReportAsync(filterDto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // SYSTEM CONFIGURATION
        // ============================================

        /// <summary>
        /// Get all system configurations
        /// </summary>
        [HttpGet("config")]
        public async Task<IActionResult> GetSystemConfigurations()
        {
            var result = await _adminService.GetSystemConfigurationsAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Update system configuration
        /// </summary>
        [HttpPut("config")]
        public async Task<IActionResult> UpdateSystemConfiguration([FromBody] UpdateSystemConfigDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.UpdateSystemConfigurationAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private async Task<int?> GetAdminIdAsync(string userId)
        {
            var admin = await _ownershipHelper.GetAdminIdAsync(userId);
            return admin;
        }
    }
}