using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.InventoryManager;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "InventoryManagerOnly")]
    public class InventoryManagerController : ControllerBase
    {
        private readonly IInventoryManagerService _inventoryManagerService;
        private readonly IOwnershipHelper _ownershipHelper;

        public InventoryManagerController(
            IInventoryManagerService inventoryManagerService,
            IOwnershipHelper ownershipHelper)
        {
            _inventoryManagerService = inventoryManagerService;
            _ownershipHelper = ownershipHelper;
        }

        // ============================================
        // PROFILE & DASHBOARD
        // ============================================

        /// <summary>
        /// Get inventory manager's profile information
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var inventoryManagerId = await GetInventoryManagerIdAsync(userId);
            if (inventoryManagerId == null)
                return NotFound(new { message = "Inventory Manager profile not found" });

            var result = await _inventoryManagerService.GetMyProfileAsync(inventoryManagerId.Value);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get inventory dashboard with statistics and alerts
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _inventoryManagerService.GetDashboardStatsAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // PRODUCT INVENTORY MANAGEMENT
        // ============================================

        /// <summary>
        /// Get all products with stock information (with filtering and pagination)
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts([FromQuery] InventoryFilterParams filterParams)
        {
            var result = await _inventoryManagerService.GetAllProductsAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get detailed inventory information for a specific product
        /// </summary>
        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductInventoryDetails(int id)
        {
            var result = await _inventoryManagerService.GetProductInventoryDetailsAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ============================================
        // STOCK UPDATE
        // ============================================

        /// <summary>
        /// Update stock quantity for a specific product
        /// </summary>
        [HttpPatch("products/{id}/stock")]
        public async Task<IActionResult> UpdateProductStock(int id, [FromBody] UpdateStockDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var inventoryManagerId = await GetInventoryManagerIdAsync(userId);

            var result = await _inventoryManagerService.UpdateProductStockAsync(id, dto, inventoryManagerId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Update stock quantities for multiple products at once
        /// </summary>
        [HttpPatch("products/bulk-update")]
        public async Task<IActionResult> BulkUpdateStock([FromBody] BulkStockUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Items == null || !dto.Items.Any())
                return BadRequest(new { message = "No items provided for bulk update" });

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized();

            var inventoryManagerId = await GetInventoryManagerIdAsync(userId);

            var result = await _inventoryManagerService.BulkUpdateStockAsync(dto, inventoryManagerId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // LOW STOCK ALERTS
        // ============================================

        /// <summary>
        /// Get all low stock alerts (products below threshold)
        /// </summary>
        [HttpGet("alerts/low-stock")]
        public async Task<IActionResult> GetLowStockAlerts([FromQuery] PaginationParams paginationParams)
        {
            var result = await _inventoryManagerService.GetLowStockAlertsAsync(paginationParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get critical low stock alerts (top 20 products with lowest stock)
        /// </summary>
        [HttpGet("alerts/critical")]
        public async Task<IActionResult> GetCriticalLowStockAlerts()
        {
            var result = await _inventoryManagerService.GetCriticalLowStockAlertsAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // STOCK ADJUSTMENT HISTORY
        // ============================================

        /// <summary>
        /// Get complete stock adjustment history with filtering
        /// </summary>
        [HttpGet("stock-history")]
        public async Task<IActionResult> GetStockAdjustmentHistory([FromQuery] StockHistoryFilterParams filterParams)
        {
            var result = await _inventoryManagerService.GetStockAdjustmentHistoryAsync(filterParams);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Get stock adjustment history for a specific product
        /// </summary>
        [HttpGet("products/{id}/history")]
        public async Task<IActionResult> GetProductStockHistory(
            int id,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var result = await _inventoryManagerService.GetProductStockHistoryAsync(id, fromDate, toDate);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Get stock adjustment statistics and analytics
        /// </summary>
        [HttpGet("stock-history/stats")]
        public async Task<IActionResult> GetStockAdjustmentStats(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var result = await _inventoryManagerService.GetStockAdjustmentStatsAsync(fromDate, toDate);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // CATEGORIES
        // ============================================

        /// <summary>
        /// Get all active categories for filtering
        /// </summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetActiveCategories()
        {
            var result = await _inventoryManagerService.GetActiveCategoriesAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private async Task<int?> GetInventoryManagerIdAsync(string userId)
        {
            var manager = await _ownershipHelper.GetInventoryManagerIdAsync(userId);
            return manager;
        }
    }
}