namespace MarketPlace.Models.DTOs.Common
{
    public class ProductFilterParams : PaginationParams
    {
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SearchTerm { get; set; }
        public int? SellerId { get; set; }
        public bool? InStock { get; set; }
        public bool? IsActive { get; set; }
    }

    // Order Filtering
    public class OrderFilterParams : PaginationParams
    {
        public int? CustomerId { get; set; }
        public int? SellerId { get; set; }
        public string? OrderStatus { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    

    // Review Filtering
    public class ReviewFilterParams : PaginationParams
    {
        public int? ProductId { get; set; }
        public int? CustomerId { get; set; }
        public int? MinRating { get; set; }
        public int? MaxRating { get; set; }
        public bool? IsVerifiedPurchase { get; set; }
    }

    public class SellerFilterParams : PaginationParams
    {
        public string? SearchTerm { get; set; }
        public bool? IsVerified { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MinRating { get; set; }
        public string? City { get; set; }
        public DateTime? RegisteredAfter { get; set; }
        public DateTime? RegisteredBefore { get; set; }
    }

    public class CustomerFilterParams : PaginationParams
    {
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; }
        public string? City { get; set; }
        public decimal? MinSpent { get; set; }
        public int? MinOrders { get; set; }
    }

    public class PaymentVerificationFilterParams : PaginationParams
    {
        public string? Status { get; set; }
        public int? SellerId { get; set; }
        public bool? IsDisputed { get; set; }
        public bool? IsExpired { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
