using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.DeliveryStaff;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "DeliveryStaffOnly")]
    public class DeliveryStaffController : ControllerBase
    {
        private readonly IDeliveryStaffService _deliveryStaffService;
        private readonly IOwnershipHelper _ownershipHelper;

        public DeliveryStaffController(
            IDeliveryStaffService deliveryStaffService,
            IOwnershipHelper ownershipHelper)
        {
            _deliveryStaffService = deliveryStaffService;
            _ownershipHelper = ownershipHelper;
        }

        // ================== PROFILE MANAGEMENT ==================

        /// <summary>
        /// Get delivery staff profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff profile not found"));

            var profile = await _deliveryStaffService.GetProfileAsync(deliveryStaffId.Value);
            if (profile == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Profile not found"));

            return Ok(ApiResponse<DeliveryStaffProfileDto>.SuccessResponse(profile, "Profile retrieved successfully"));
        }

        /// <summary>
        /// Update delivery staff profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateDeliveryStaffProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.UpdateProfileAsync(deliveryStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update profile"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Profile updated successfully"));
        }

        /// <summary>
        /// Update availability status
        /// </summary>
        [HttpPut("availability")]
        public async Task<IActionResult> UpdateAvailability([FromBody] UpdateAvailabilityDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.UpdateAvailabilityAsync(deliveryStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update availability"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                dto.IsAvailable ? "Status set to Available" : "Status set to Unavailable"));
        }

        // ================== ORDER ASSIGNMENT (SELF-ASSIGNMENT) ==================

        /// <summary>
        /// Get available orders for self-assignment
        /// </summary>
        [HttpGet("orders/available")]
        public async Task<IActionResult> GetAvailableOrders([FromQuery] DeliveryFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var orders = await _deliveryStaffService.GetAvailableOrdersAsync(deliveryStaffId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<AvailableOrderDto>>.SuccessResponse(orders,
                "Available orders retrieved successfully"));
        }

        /// <summary>
        /// Self-assign an order
        /// </summary>
        [HttpPost("orders/assign")]
        public async Task<IActionResult> SelfAssignOrder([FromBody] SelfAssignOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.SelfAssignOrderAsync(deliveryStaffId.Value, dto.OrderId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to assign order. Order may already be assigned or you may be unavailable."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Order #{dto.OrderId} assigned successfully"));
        }

        /// <summary>
        /// Unassign an order (if unable to complete delivery)
        /// </summary>
        [HttpPost("orders/unassign")]
        public async Task<IActionResult> UnassignOrder([FromBody] UnassignOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.UnassignOrderAsync(deliveryStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to unassign order. Order may not be assigned to you or already delivered."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Order #{dto.OrderId} unassigned successfully. It will be available for other delivery staff."));
        }

        // ================== ASSIGNED ORDERS MANAGEMENT ==================

        /// <summary>
        /// Get my assigned orders
        /// </summary>
        [HttpGet("orders/assigned")]
        public async Task<IActionResult> GetMyAssignedOrders([FromQuery] DeliveryFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var orders = await _deliveryStaffService.GetMyAssignedOrdersAsync(deliveryStaffId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<AssignedOrderDto>>.SuccessResponse(orders,
                "Assigned orders retrieved successfully"));
        }

        /// <summary>
        /// Get order details with items and customer info
        /// </summary>
        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var order = await _deliveryStaffService.GetOrderDetailsAsync(deliveryStaffId.Value, orderId);
            if (order == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Order not found or not assigned to you"));

            return Ok(ApiResponse<AssignedOrderDto>.SuccessResponse(order,
                "Order details retrieved successfully"));
        }

        // ================== ORDER STATUS UPDATES ==================

        /// <summary>
        /// Update order status (PickedUp, OnTheWay)
        /// </summary>
        [HttpPut("orders/status")]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.UpdateOrderStatusAsync(deliveryStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to update status. Invalid status or status transition."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Order #{dto.OrderId} status updated to {dto.NewStatus}"));
        }

        /// <summary>
        /// Mark order as delivered (starts verification period)
        /// </summary>
        [HttpPost("orders/deliver")]
        public async Task<IActionResult> MarkAsDelivered([FromBody] MarkAsDeliveredDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var result = await _deliveryStaffService.MarkAsDeliveredAsync(deliveryStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to mark as delivered. Order must be in 'OnTheWay' status."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Order #{dto.OrderId} marked as delivered. Verification period started."));
        }

        // ================== DELIVERY HISTORY ==================

        /// <summary>
        /// Get delivery history
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetDeliveryHistory([FromQuery] DeliveryFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var history = await _deliveryStaffService.GetDeliveryHistoryAsync(deliveryStaffId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<DeliveryHistoryDto>>.SuccessResponse(history,
                "Delivery history retrieved successfully"));
        }

        // ================== STATISTICS ==================

        /// <summary>
        /// Get delivery statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var deliveryStaffId = await GetDeliveryStaffIdAsync(userId);
            if (!deliveryStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Delivery staff not found"));

            var stats = await _deliveryStaffService.GetMyStatisticsAsync(deliveryStaffId.Value);
            return Ok(ApiResponse<DeliveryStatsDto>.SuccessResponse(stats,
                "Statistics retrieved successfully"));
        }

        // ================== HELPER METHODS ==================

        private async Task<int?> GetDeliveryStaffIdAsync(string userId)
        {
            return await _ownershipHelper.GetDeliveryStaffIdAsync(userId);
        }
    }
}