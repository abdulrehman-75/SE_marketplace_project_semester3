using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Customer
{
    public class ProductListDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; } = null!;
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public decimal SellerRating { get; set; }
        public int ReviewCount { get; set; }
        public decimal AverageRating { get; set; }
    }

    public class ProductDetailDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateListed { get; set; }
        public string CategoryName { get; set; } = null!;
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public string? SellerShopLogo { get; set; }
        public decimal SellerOverallRating { get; set; }
        public int SellerTotalReviews { get; set; }
        public bool IsSellerFollowed { get; set; }
        public List<ProductReviewDto> Reviews { get; set; } = new();
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }

    public class ProductReviewDto
    {
        public int ReviewId { get; set; }
        public string CustomerName { get; set; } = null!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime DatePosted { get; set; }
        public bool IsVerifiedPurchase { get; set; }
    }
}
