using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.InventoryManager
{
    public class ProductInventoryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int LowStockThreshold { get; set; }
        public bool IsLowStock { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateListed { get; set; }

        // Seller Information
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public string? SellerContactPhone { get; set; }
        public string? SellerEmail { get; set; }

        // Additional Info
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    // ============================================
    // STOCK UPDATE DTOs
    // ============================================

    public class UpdateStockDto
    {
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity must be 0 or greater")]
        public int StockQuantity { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class BulkStockUpdateDto
    {
        [Required]
        public List<BulkStockItem> Items { get; set; } = new();
    }

    public class BulkStockItem
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
    }

    public class StockUpdateResponseDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int OldStockQuantity { get; set; }
        public int NewStockQuantity { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================
    // LOW STOCK ALERT DTOs
    // ============================================

    public class LowStockAlertDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public string CategoryName { get; set; } = null!;
        public int CurrentStock { get; set; }
        public int LowStockThreshold { get; set; }
        public int StockDeficit { get; set; }
        public bool IsOutOfStock { get; set; }
        public DateTime LastRestocked { get; set; }

        // Seller Information
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public string? SellerPhone { get; set; }
        public string? SellerEmail { get; set; }

        // Priority Calculation
        public string Priority { get; set; } = null!; // Critical, High, Medium, Low
        public int DaysSinceLastRestock { get; set; }
    }
}
