using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public enum AdjustmentType
    {
        ManualUpdate,
        BulkUpdate,
        OrderPlaced,
        OrderCancelled,
        Restock,
        Damaged,
        Lost,
        Returned,
        SystemCorrection
    }

    public class StockAdjustment
    {
        [Key]
        public int StockAdjustmentId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;

        [Required]
        public int PreviousQuantity { get; set; }

        [Required]
        public int NewQuantity { get; set; }

        [Required]
        public int QuantityChanged { get; set; } // Can be positive or negative

        [Required]
        [MaxLength(50)]
        public string AdjustmentType { get; set; } = nameof(Models.AdjustmentType.ManualUpdate);

        [MaxLength(1000)]
        public string? Reason { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public DateTime AdjustmentDate { get; set; } = DateTime.UtcNow;

        // Who made the adjustment
        public int? InventoryManagerId { get; set; }

        [ForeignKey("InventoryManagerId")]
        public InventoryManager? InventoryManager { get; set; }

        [MaxLength(100)]
        public string? AdjustedBy { get; set; } // Can be system, admin, etc.

        // Reference to related entity (order, complaint, etc.)
        public int? RelatedEntityId { get; set; }

        [MaxLength(50)]
        public string? RelatedEntityType { get; set; } // Order, Complaint, etc.

        // For audit purposes
        [Required]
        public bool IsAutomated { get; set; } = false;

        [MaxLength(100)]
        public string? IPAddress { get; set; }
    }
}