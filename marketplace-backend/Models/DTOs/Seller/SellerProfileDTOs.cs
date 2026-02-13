namespace MarketPlace.Models.DTOs.Seller
{
    public class SellerProfileDto
    {
        public int SellerId { get; set; }
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string ShopName { get; set; } = null!;
        public string? ShopDescription { get; set; }
        public string? ShopLogo { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public DateTime DateRegistered { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public decimal OverallRating { get; set; }
        public int TotalReviews { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public int TotalFollowers { get; set; }
        public int PendingPayments { get; set; }
    }

    public class SellerDashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int LowStockProducts { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal PendingPayments { get; set; }
        public decimal ReleasedPayments { get; set; }
        public int TotalFollowers { get; set; }
        public decimal OverallRating { get; set; }
        public int TotalReviews { get; set; }

        public List<ProductResponseDto> RecentProducts { get; set; } = new();
        public List<SellerOrderResponseDto> RecentOrders { get; set; } = new();
        public List<PaymentVerificationResponseDto> PendingVerifications { get; set; } = new();
    }
}
