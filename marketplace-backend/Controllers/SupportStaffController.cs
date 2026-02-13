using MarketPlace.Helpers;
using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.SupportStaff;
using MarketPlace.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "SupportStaffOnly")]
    public class SupportStaffController : ControllerBase
    {
        private readonly ISupportStaffService _supportStaffService;
        private readonly IOwnershipHelper _ownershipHelper;

        public SupportStaffController(
            ISupportStaffService supportStaffService,
            IOwnershipHelper ownershipHelper)
        {
            _supportStaffService = supportStaffService;
            _ownershipHelper = ownershipHelper;
        }

        // ================== PROFILE MANAGEMENT ==================

        /// <summary>
        /// Get support staff profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff profile not found"));

            var profile = await _supportStaffService.GetProfileAsync(supportStaffId.Value);
            if (profile == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Profile not found"));

            return Ok(ApiResponse<SupportStaffProfileDto>.SuccessResponse(profile, "Profile retrieved successfully"));
        }

        /// <summary>
        /// Update support staff profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateSupportStaffProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.UpdateProfileAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update profile"));

            return Ok(ApiResponse<string>.SuccessResponse(null!, "Profile updated successfully"));
        }

        // ================== COMPLAINT MANAGEMENT - LIST & VIEW ==================

        /// <summary>
        /// Get all complaints with filters
        /// </summary>
        [HttpGet("complaints")]
        public async Task<IActionResult> GetAllComplaints([FromQuery] ComplaintFilterParams filterParams)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var complaints = await _supportStaffService.GetAllComplaintsAsync(supportStaffId.Value, filterParams);
            return Ok(ApiResponse<PagedResult<ComplaintListDto>>.SuccessResponse(complaints,
                "Complaints retrieved successfully"));
        }

        /// <summary>
        /// Get complaint details with order history and conversation
        /// </summary>
        [HttpGet("complaints/{complaintId}")]
        public async Task<IActionResult> GetComplaintDetails(int complaintId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var complaint = await _supportStaffService.GetComplaintDetailsAsync(supportStaffId.Value, complaintId);
            if (complaint == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Complaint not found"));

            return Ok(ApiResponse<ComplaintDetailDto>.SuccessResponse(complaint,
                "Complaint details retrieved successfully"));
        }

        // ================== COMPLAINT ASSIGNMENT ==================

        /// <summary>
        /// Self-assign a complaint
        /// </summary>
        [HttpPost("complaints/assign")]
        public async Task<IActionResult> SelfAssignComplaint([FromBody] SelfAssignComplaintDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.SelfAssignComplaintAsync(supportStaffId.Value, dto.ComplaintId);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to assign complaint. Complaint may already be assigned."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint #{dto.ComplaintId} assigned successfully"));
        }

        // ================== COMPLAINT STATUS & PRIORITY UPDATES ==================

        /// <summary>
        /// Update complaint status
        /// </summary>
        [HttpPut("complaints/status")]
        public async Task<IActionResult> UpdateComplaintStatus([FromBody] UpdateComplaintStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.UpdateComplaintStatusAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update status"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint status updated to {dto.NewStatus}"));
        }

        /// <summary>
        /// Update complaint priority
        /// </summary>
        [HttpPut("complaints/priority")]
        public async Task<IActionResult> UpdateComplaintPriority([FromBody] UpdateComplaintPriorityDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.UpdateComplaintPriorityAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update priority"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint priority updated to {dto.Priority}"));
        }

        // ================== COMPLAINT RESOLUTION ==================

        /// <summary>
        /// Add note/message to complaint conversation
        /// </summary>
        [HttpPost("complaints/notes")]
        public async Task<IActionResult> AddComplaintNote([FromBody] AddComplaintNoteDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.AddComplaintNoteAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to add note"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                dto.IsInternal ? "Internal note added successfully" : "Message added successfully"));
        }

        /// <summary>
        /// Resolve complaint with resolution notes
        /// </summary>
        [HttpPost("complaints/resolve")]
        public async Task<IActionResult> ResolveComplaint([FromBody] ResolveComplaintDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.ResolveComplaintAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to resolve complaint"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint #{dto.ComplaintId} resolved successfully"));
        }

        /// <summary>
        /// Escalate complaint to Admin
        /// </summary>
        [HttpPost("complaints/escalate")]
        public async Task<IActionResult> EscalateToAdmin([FromBody] EscalateToAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.EscalateToAdminAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to escalate complaint"));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint #{dto.ComplaintId} escalated to Admin successfully"));
        }

        /// <summary>
        /// De-escalate complaint from Admin back to Support Staff
        /// </summary>
        [HttpPost("complaints/deescalate")]
        public async Task<IActionResult> DeEscalateComplaint([FromBody] DeEscalateComplaintDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var result = await _supportStaffService.DeEscalateComplaintAsync(supportStaffId.Value, dto);
            if (!result)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Failed to de-escalate complaint. Complaint may not be in escalated status."));

            return Ok(ApiResponse<string>.SuccessResponse(null!,
                $"Complaint #{dto.ComplaintId} de-escalated successfully and returned to support workflow."));
        }

        // ================== CUSTOMER ORDER HISTORY ==================

        /// <summary>
        /// Get customer's complete order history (for investigation)
        /// </summary>
        [HttpGet("customers/{customerId}/orders")]
        public async Task<IActionResult> GetCustomerOrderHistory(int customerId)
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var history = await _supportStaffService.GetCustomerOrderHistoryAsync(supportStaffId.Value, customerId);
            if (history == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            return Ok(ApiResponse<CustomerOrderHistoryDto>.SuccessResponse(history,
                "Customer order history retrieved successfully"));
        }

        // ================== STATISTICS ==================

        /// <summary>
        /// Get support staff statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var userId = _ownershipHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

            var supportStaffId = await GetSupportStaffIdAsync(userId);
            if (!supportStaffId.HasValue)
                return NotFound(ApiResponse<object>.ErrorResponse("Support staff not found"));

            var stats = await _supportStaffService.GetMyStatisticsAsync(supportStaffId.Value);
            return Ok(ApiResponse<SupportStaffStatsDto>.SuccessResponse(stats,
                "Statistics retrieved successfully"));
        }

        // ================== HELPER METHODS ==================

        private async Task<int?> GetSupportStaffIdAsync(string userId)
        {
            return await _ownershipHelper.GetSupportStaffIdAsync(userId);
        }
    }
}