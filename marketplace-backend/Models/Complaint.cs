using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public enum ComplaintType
    {
        ProductQuality,
        PaymentDispute,
        DeliveryIssue,
        SellerIssue,
        RefundRequest,
        Other
    }

    public enum ComplaintStatus
    {
        Open,
        InProgress,
        Resolved,
        Closed,
        Escalated
    }

    public class Complaint
    {
        [Key]
        public int ComplaintId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string ComplaintType { get; set; } = nameof(Models.ComplaintType.Other);

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = nameof(Models.ComplaintStatus.Open);

        [Required]
        public DateTime DateReported { get; set; } = DateTime.UtcNow;

        public int? AssignedSupportStaffId { get; set; }

        [ForeignKey("AssignedSupportStaffId")]
        public SupportStaff? AssignedSupportStaff { get; set; }

        [MaxLength(2000)]
        public string? ResolutionNotes { get; set; }

        public DateTime? ResolvedDate { get; set; }

        [MaxLength(50)]
        public string? Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent

        // Supporting evidence
        [MaxLength(500)]
        public string? AttachedImages { get; set; } // Comma-separated file paths
    }
}
