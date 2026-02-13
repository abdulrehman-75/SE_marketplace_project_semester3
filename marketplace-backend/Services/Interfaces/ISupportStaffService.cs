using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.SupportStaff;

namespace MarketPlace.Services.Interfaces
{
    public interface ISupportStaffService
    {
        // Profile Management
        Task<SupportStaffProfileDto?> GetProfileAsync(int supportStaffId);
        Task<bool> UpdateProfileAsync(int supportStaffId, UpdateSupportStaffProfileDto dto);

        // Complaint Management - List & View
        Task<PagedResult<ComplaintListDto>> GetAllComplaintsAsync(int supportStaffId, ComplaintFilterParams filterParams);
        Task<ComplaintDetailDto?> GetComplaintDetailsAsync(int supportStaffId, int complaintId);

        // Complaint Assignment
        Task<bool> SelfAssignComplaintAsync(int supportStaffId, int complaintId);

        // Complaint Status & Priority Updates
        Task<bool> UpdateComplaintStatusAsync(int supportStaffId, UpdateComplaintStatusDto dto);
        Task<bool> UpdateComplaintPriorityAsync(int supportStaffId, UpdateComplaintPriorityDto dto);

        // Complaint Resolution
        Task<bool> AddComplaintNoteAsync(int supportStaffId, AddComplaintNoteDto dto);
        Task<bool> ResolveComplaintAsync(int supportStaffId, ResolveComplaintDto dto);
        Task<bool> EscalateToAdminAsync(int supportStaffId, EscalateToAdminDto dto);
        Task<bool> DeEscalateComplaintAsync(int supportStaffId, DeEscalateComplaintDto dto); // NEW

        // Customer Order History (for complaint investigation)
        Task<CustomerOrderHistoryDto?> GetCustomerOrderHistoryAsync(int supportStaffId, int customerId);

        // Statistics
        Task<SupportStaffStatsDto> GetMyStatisticsAsync(int supportStaffId);
    }
}