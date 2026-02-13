namespace MarketPlace.Models.DTOs.Admin
{
    public class SalesReportFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? SellerId { get; set; }
        public int? CategoryId { get; set; }
        public string? GroupBy { get; set; } // "Day", "Week", "Month", "Year"
    }

    public class SalesReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalBuyerProtectionFees { get; set; }
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int DisputedOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<TopSellerDto> TopSellers { get; set; } = new();
        public List<TopCategoryDto> TopCategories { get; set; } = new();
        public List<SalesTrendDto> SalesTrend { get; set; } = new();
    }

    public class TopSellerDto
    {
        public int SellerId { get; set; }
        public string ShopName { get; set; } = null!;
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageRating { get; set; }
    }

    public class TopCategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
    }

    public class SalesTrendDto
    {
        public DateTime Date { get; set; }
        public string Period { get; set; } = null!;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }
}
