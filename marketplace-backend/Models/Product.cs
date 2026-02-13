using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        public int SellerId { get; set; }
        [ForeignKey("SellerId")]
        public Seller Seller { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = null!;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        // NEW: Foreign Key to Category
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category Category { get; set; } = null!;


        [Required]
        public int StockQuantity { get; set; }

        [MaxLength(300)]
        public string? ProductImage { get; set; }

        [Required]
        public DateTime DateListed { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsActive { get; set; } = true;

        // Low stock alert threshold
        [Required]
        public int LowStockThreshold { get; set; } = 10;

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        // adding it at testing phase to avoid race condition
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;
    }
}