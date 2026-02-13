namespace MarketPlace.Models.DTOs.InventoryManager
{
    public class InventoryDashboardDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int InactiveProducts { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalSellers { get; set; }
        public decimal TotalInventoryValue { get; set; }

        // Recent Activity
        public List<LowStockAlertDto> CriticalLowStockAlerts { get; set; } = new();
        public List<ProductInventoryDto> RecentlyUpdatedProducts { get; set; } = new();
        public List<CategoryStockSummaryDto> CategoryStockSummary { get; set; } = new();
    }

    public class CategoryStockSummaryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public int TotalProducts { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public decimal TotalValue { get; set; }
    }

    // ============================================
    // FILTER DTOs
    // ============================================

    public class InventoryFilterParams : Common.PaginationParams
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public int? SellerId { get; set; }
        public bool? IsLowStock { get; set; }
        public bool? IsOutOfStock { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
