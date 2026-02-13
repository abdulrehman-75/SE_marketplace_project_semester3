using MarketPlace.Models.DTOs.Common;

namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminCustomerListDto
    {
        public int CustomerId { get; set; }
        public string UserId { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? City { get; set; }
        public DateTime DateRegistered { get; set; }
        public bool IsActive { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public int TotalReviews { get; set; }
        public int TotalComplaints { get; set; }
    }

    public class AdminCustomerDetailDto : AdminCustomerListDto
    {
        public string? ShippingAddress { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public int FollowedSellersCount { get; set; }
        public List<CustomerOrderSummaryDto> RecentOrders { get; set; } = new();
    }

    public class CustomerOrderSummaryDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
    }
}
