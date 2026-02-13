using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        PickedUp,
        OnTheWay,
        Delivered,
        Completed,
        Cancelled,
        Disputed
    }

    public enum PaymentStatus
    {
        Pending,
        VerificationPeriod,
        Confirmed,
        Released,
        Frozen,
        Disputed,
        AutoReleased,
        ManuallyReleased,
        Cancelled  
    }

    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyerProtectionFee { get; set; } // 2% of TotalAmount

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GrandTotal { get; set; } // TotalAmount + BuyerProtectionFee

        [Required]
        [MaxLength(50)]
        public string OrderStatus { get; set; } = nameof(Models.OrderStatus.Pending);

        [Required]
        [MaxLength(50)]
        public string PaymentStatus { get; set; } = nameof(Models.PaymentStatus.Pending);

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash on Delivery";

        // Delivery Information
        public int? DeliveryStaffId { get; set; }

        [ForeignKey("DeliveryStaffId")]
        public DeliveryStaff? DeliveryStaff { get; set; }

        [Required]
        [MaxLength(300)]
        public string DeliveryAddress { get; set; } = null!;

        [MaxLength(100)]
        public string? DeliveryCity { get; set; }

        [MaxLength(20)]
        public string? DeliveryPostalCode { get; set; }

        [MaxLength(20)]
        public string? CustomerPhone { get; set; }

        public DateTime? DeliveryDate { get; set; }

        // Verification Period
        public DateTime? VerificationPeriodStart { get; set; }
        public DateTime? VerificationPeriodEnd { get; set; }

        [Required]
        public bool CustomerConfirmedReceipt { get; set; } = false;

        [Required]
        public bool CustomerReportedProblem { get; set; } = false;

        [MaxLength(1000)]
        public string? ProblemDescription { get; set; }

        // Support Assignment for Disputes
        public int? AssignedSupportStaffId { get; set; }

        [ForeignKey("AssignedSupportStaffId")]
        public SupportStaff? AssignedSupportStaff { get; set; }

        [MaxLength(2000)]
        public string? AdminNotes { get; set; }

        public DateTime? CancelledDate { get; set; }

        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<PaymentVerification> PaymentVerifications { get; set; } = new List<PaymentVerification>();
    }
}
