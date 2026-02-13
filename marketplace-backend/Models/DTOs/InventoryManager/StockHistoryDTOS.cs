namespace MarketPlace.Models.DTOs.InventoryManager
{
    public class StockAdjustmentHistoryDto
    {
        public int StockAdjustmentId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public int QuantityChanged { get; set; }
        public string AdjustmentType { get; set; } = null!;
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public DateTime AdjustmentDate { get; set; }
        public string? AdjustedBy { get; set; }
        public bool IsAutomated { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }
        public string? InventoryManagerName { get; set; }
    }

    public class ProductStockHistoryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int CurrentStock { get; set; }
        public int TotalAdjustments { get; set; }
        public int TotalIncreased { get; set; }
        public int TotalDecreased { get; set; }
        public DateTime? LastAdjustmentDate { get; set; }
        public List<StockAdjustmentHistoryDto> AdjustmentHistory { get; set; } = new();
    }

    public class StockAdjustmentStatsDto
    {
        public int TotalAdjustments { get; set; }
        public int ManualAdjustments { get; set; }
        public int AutomatedAdjustments { get; set; }
        public int TodaysAdjustments { get; set; }
        public int ThisWeekAdjustments { get; set; }
        public int ThisMonthAdjustments { get; set; }
        public int TotalStockIncreased { get; set; }
        public int TotalStockDecreased { get; set; }
        public List<AdjustmentTypeBreakdownDto> AdjustmentsByType { get; set; } = new();
        public List<TopAdjustedProductDto> TopAdjustedProducts { get; set; } = new();
    }

    public class AdjustmentTypeBreakdownDto
    {
        public string AdjustmentType { get; set; } = null!;
        public int Count { get; set; }
        public int TotalQuantityChanged { get; set; }
    }

    public class TopAdjustedProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int AdjustmentCount { get; set; }
        public int TotalQuantityChanged { get; set; }
    }

    // Filter parameters for stock history
    public class StockHistoryFilterParams : Common.PaginationParams
    {
        public int? ProductId { get; set; }
        public string? AdjustmentType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsAutomated { get; set; }
        public int? InventoryManagerId { get; set; }
        public string? SearchTerm { get; set; }
    }
}