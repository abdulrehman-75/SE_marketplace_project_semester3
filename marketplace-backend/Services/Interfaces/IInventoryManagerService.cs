using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.InventoryManager;
using MarketPlace.Models.DTOs.Seller;

namespace MarketPlace.Services.Interfaces
{
    public interface IInventoryManagerService
    {
        // Profile & Dashboard
        Task<ApiResponse<InventoryManagerProfileDto>> GetMyProfileAsync(int inventoryManagerId);
        Task<ApiResponse<InventoryDashboardDto>> GetDashboardStatsAsync();

        // Product Inventory Management
        Task<ApiResponse<PagedResult<ProductInventoryDto>>> GetAllProductsAsync(InventoryFilterParams filterParams);
        Task<ApiResponse<ProductInventoryDto>> GetProductInventoryDetailsAsync(int productId);

        // Stock Updates
        Task<ApiResponse<StockUpdateResponseDto>> UpdateProductStockAsync(int productId, UpdateStockDto dto, int? inventoryManagerId = null);
        Task<ApiResponse<List<StockUpdateResponseDto>>> BulkUpdateStockAsync(BulkStockUpdateDto dto, int? inventoryManagerId = null);

        // Stock Adjustment History (NEW)
        Task<ApiResponse<PagedResult<StockAdjustmentHistoryDto>>> GetStockAdjustmentHistoryAsync(StockHistoryFilterParams filterParams);
        Task<ApiResponse<ProductStockHistoryDto>> GetProductStockHistoryAsync(int productId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<ApiResponse<StockAdjustmentStatsDto>> GetStockAdjustmentStatsAsync(DateTime? fromDate = null, DateTime? toDate = null);

        // Low Stock Alerts
        Task<ApiResponse<PagedResult<LowStockAlertDto>>> GetLowStockAlertsAsync(PaginationParams paginationParams);
        Task<ApiResponse<List<LowStockAlertDto>>> GetCriticalLowStockAlertsAsync();

        // Categories
        Task<ApiResponse<List<CategoryListDto>>> GetActiveCategoriesAsync();
    }
}