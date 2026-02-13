using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminProductListDto
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
        public DateTime DateListed { get; set; }
        public int TotalReviews { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalSales { get; set; }
    }

    public class UpdateProductStatusDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }
    }
}
