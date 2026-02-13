namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public PlatformStatsDto PlatformStats { get; set; } = new();
        public RevenueStatsDto RevenueStats { get; set; } = new();
        public UserStatsDto UserStats { get; set; } = new();
        public OrderStatsDto OrderStats { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public List<PaymentVerificationSummaryDto> PendingVerifications { get; set; } = new();
        public List<AdminComplaintSummaryDto> RecentComplaints { get; set; } = new();
    }

    public class PlatformStatsDto
    {
        public int TotalSellers { get; set; }
        public int ActiveSellers { get; set; }
        public int TotalCustomers { get; set; }
        public int ActiveCustomers { get; set; }
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalStaff { get; set; }
    }

    public class RevenueStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public decimal TotalBuyerProtectionFees { get; set; }
        public decimal PendingPayments { get; set; }
        public decimal ReleasedPayments { get; set; }
    }

    public class UserStatsDto
    {
        public int NewSellersToday { get; set; }
        public int NewCustomersToday { get; set; }
        public int NewSellersThisMonth { get; set; }
        public int NewCustomersThisMonth { get; set; }
    }

    public class OrderStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int DisputedOrders { get; set; }
        public int TodayOrders { get; set; }
        public int ThisMonthOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public string? RelatedEntity { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    public class AdminComplaintSummaryDto
    {
        public int ComplaintId { get; set; }
        public int OrderId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string ComplaintType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public DateTime DateReported { get; set; }
        public string? AssignedStaffName { get; set; }
    }
}
