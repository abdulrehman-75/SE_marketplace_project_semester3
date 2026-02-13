using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.DeliveryStaff;

namespace MarketPlace.Services.Interfaces
{
    public interface IDeliveryStaffService
    {
        // Profile Management
        Task<DeliveryStaffProfileDto?> GetProfileAsync(int deliveryStaffId);
        Task<bool> UpdateProfileAsync(int deliveryStaffId, UpdateDeliveryStaffProfileDto dto);
        Task<bool> UpdateAvailabilityAsync(int deliveryStaffId, UpdateAvailabilityDto dto);

        // Order Assignment (Self-Assignment)
        Task<PagedResult<AvailableOrderDto>> GetAvailableOrdersAsync(int deliveryStaffId, DeliveryFilterParams filterParams);
        Task<bool> SelfAssignOrderAsync(int deliveryStaffId, int orderId);
        Task<bool> UnassignOrderAsync(int deliveryStaffId, UnassignOrderDto dto); // NEW

        // Assigned Orders Management
        Task<PagedResult<AssignedOrderDto>> GetMyAssignedOrdersAsync(int deliveryStaffId, DeliveryFilterParams filterParams);
        Task<AssignedOrderDto?> GetOrderDetailsAsync(int deliveryStaffId, int orderId);

        // Order Status Updates
        Task<bool> UpdateOrderStatusAsync(int deliveryStaffId, UpdateOrderStatusDto dto);
        Task<bool> MarkAsDeliveredAsync(int deliveryStaffId, MarkAsDeliveredDto dto);

        // Delivery History
        Task<PagedResult<DeliveryHistoryDto>> GetDeliveryHistoryAsync(int deliveryStaffId, DeliveryFilterParams filterParams);

        // Statistics
        Task<DeliveryStatsDto> GetMyStatisticsAsync(int deliveryStaffId);
    }
}