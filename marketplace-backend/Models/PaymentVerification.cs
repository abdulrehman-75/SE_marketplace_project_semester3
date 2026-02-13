using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public class PaymentVerification
    {
        [Key]
        public int VerificationId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        public int SellerId { get; set; }

        [ForeignKey("SellerId")]
        public Seller Seller { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime VerificationStartDate { get; set; }

        [Required]
        public DateTime VerificationEndDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = nameof(Models.PaymentStatus.Pending);

        [Required]
        [MaxLength(50)]
        public string CustomerAction { get; set; } = "None"; // None, Confirmed, Reported

        public DateTime? ActionDate { get; set; }

        public DateTime? ReleasedDate { get; set; }

        // For manual intervention by Admin
        public string? ReleasedBy { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
