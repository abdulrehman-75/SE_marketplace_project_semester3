using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Customer
{
    public class FollowSellerDto
    {
        [Required]
        public int SellerId { get; set; }
    }

    public class FollowedSellerDto
    {
        public int SellerId { get; set; }
        public string ShopName { get; set; } = null!;
        public string? ShopLogo { get; set; }
        public string? ShopDescription { get; set; }
        public decimal OverallRating { get; set; }
        public int TotalReviews { get; set; }
        public DateTime DateFollowed { get; set; }
        public bool NotificationsEnabled { get; set; }
        public int TotalProducts { get; set; }
    }

    public class FollowedSellerProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public DateTime DateListed { get; set; }
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public decimal SellerRating { get; set; }
    }
}
