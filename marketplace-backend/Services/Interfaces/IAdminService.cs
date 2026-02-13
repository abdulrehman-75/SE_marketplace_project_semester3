using MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Admin.MarketPlace.Models.DTOs.Admin;
using MarketPlace.Models.DTOs.Common;

namespace MarketPlace.Services.Interfaces
{
    public interface IAdminService
    {
        // ============================================
        // PROFILE MANAGEMENT
        // ============================================
        Task<ApiResponse<AdminProfileDto>> GetMyProfileAsync(int adminId);

        // ============================================
        // SELLER MANAGEMENT
        // ============================================
        Task<ApiResponse<PagedResult<AdminSellerListDto>>> GetAllSellersAsync(SellerFilterParams filterParams);
        Task<ApiResponse<AdminSellerDetailDto>> GetSellerDetailsAsync(int sellerId);
        Task<ApiResponse<int>> CreateSellerAsync(CreateSellerByAdminDto dto);
        Task<ApiResponse<bool>> UpdateSellerStatusAsync(UpdateSellerStatusDto dto);
        Task<ApiResponse<bool>> DeleteSellerAsync(int sellerId);

        // ============================================
        // CUSTOMER MANAGEMENT
        // ============================================
        Task<ApiResponse<PagedResult<AdminCustomerListDto>>> GetAllCustomersAsync(CustomerFilterParams filterParams);
        Task<ApiResponse<AdminCustomerDetailDto>> GetCustomerDetailsAsync(int customerId);

        // ============================================
        // ORDER MANAGEMENT
        // ============================================
        Task<ApiResponse<PagedResult<AdminOrderListDto>>> GetAllOrdersAsync(OrderFilterParams filterParams);
        Task<ApiResponse<AdminOrderDetailDto>> GetOrderDetailsAsync(int orderId);
        Task<ApiResponse<bool>> AdminConfirmOrderAsync(int adminId, int orderId, AdminConfirmOrderDto dto);

        // ============================================
        // PAYMENT VERIFICATION MANAGEMENT
        // ============================================
        Task<ApiResponse<PagedResult<PaymentVerificationSummaryDto>>> GetAllPaymentVerificationsAsync(PaymentVerificationFilterParams filterParams);
        Task<ApiResponse<PaymentVerificationDetailDto>> GetPaymentVerificationDetailsAsync(int verificationId);
        Task<ApiResponse<bool>> ManualPaymentActionAsync(int adminId, ManualPaymentActionDto dto);

        // ============================================
        // CATEGORY MANAGEMENT (Simple CRUD)
        // ============================================
        Task<ApiResponse<List<CategoryWithStatsDto>>> GetAllCategoriesAsync();
        Task<ApiResponse<CategoryWithStatsDto>> GetCategoryByIdAsync(int categoryId);
        Task<ApiResponse<int>> CreateCategoryAsync(CreateCategoryDto dto);
        Task<ApiResponse<bool>> UpdateCategoryAsync(UpdateCategoryDto dto);
        Task<ApiResponse<bool>> DeleteCategoryAsync(int categoryId);
        Task<ApiResponse<string>> UploadCategoryImageAsync(int categoryId, IFormFile image);

        // ============================================
        // PRODUCT MODERATION
        // ============================================
        Task<ApiResponse<PagedResult<AdminProductListDto>>> GetAllProductsAsync(ProductFilterParams filterParams);
        Task<ApiResponse<bool>> UpdateProductStatusAsync(UpdateProductStatusDto dto);

        // ============================================
        // REVIEW MODERATION
        // ============================================
        Task<ApiResponse<PagedResult<AdminReviewListDto>>> GetAllReviewsAsync(PaginationParams paginationParams);
        Task<ApiResponse<bool>> ModerateReviewAsync(ModerateReviewDto dto);

        // ============================================
        // STAFF MANAGEMENT
        // ============================================
        Task<ApiResponse<List<StaffListDto>>> GetAllDeliveryStaffAsync();
        Task<ApiResponse<int>> CreateDeliveryStaffAsync(CreateDeliveryStaffDto dto);
        Task<ApiResponse<bool>> UpdateStaffStatusAsync(string staffType, int staffId, bool isActive);

        Task<ApiResponse<List<StaffListDto>>> GetAllSupportStaffAsync();
        Task<ApiResponse<int>> CreateSupportStaffAsync(CreateSupportStaffDto dto);

        Task<ApiResponse<List<StaffListDto>>> GetAllInventoryManagersAsync();
        Task<ApiResponse<int>> CreateInventoryManagerAsync(CreateInventoryManagerDto dto);

        // ============================================
        // COMPLAINT OVERSIGHT
        // ============================================
        Task<ApiResponse<PagedResult<AdminComplaintSummaryDto>>> GetAllComplaintsAsync(PaginationParams paginationParams);

        // ============================================
        // SALES REPORTS
        // ============================================
        Task<ApiResponse<SalesReportDto>> GenerateSalesReportAsync(SalesReportFilterDto filterDto);

        // ============================================
        // SYSTEM CONFIGURATION
        // ============================================
        Task<ApiResponse<List<SystemConfigDto>>> GetSystemConfigurationsAsync();
        Task<ApiResponse<bool>> UpdateSystemConfigurationAsync(UpdateSystemConfigDto dto);

        // ============================================
        // DASHBOARD & STATISTICS
        // ============================================
        Task<ApiResponse<AdminDashboardDto>> GetDashboardStatsAsync();
    }
}