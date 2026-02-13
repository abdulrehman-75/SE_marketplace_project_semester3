using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(2000)]
        public string? Comment { get; set; }

        [Required]
        public DateTime DatePosted { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsVerifiedPurchase { get; set; } = true;

        // Optional: Admin moderation
        [Required]
        public bool IsApproved { get; set; } = true;

        public DateTime? ModeratedDate { get; set; }

        [MaxLength(500)]
        public string? ModerationNotes { get; set; }
    }
}
