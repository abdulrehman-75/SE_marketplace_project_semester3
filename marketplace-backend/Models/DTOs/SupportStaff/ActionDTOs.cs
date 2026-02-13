using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.SupportStaff
{
    public class SelfAssignComplaintDto
    {
        [Required]
        public int ComplaintId { get; set; }
    }

    public class UpdateComplaintStatusDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; } = null!; // InProgress, Resolved, Closed, Escalated
    }

    public class UpdateComplaintPriorityDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Priority { get; set; } = null!; // Low, Medium, High, Urgent
    }

    public class AddComplaintNoteDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = null!;

        public bool IsInternal { get; set; } = false; // Internal notes not visible to customer
    }

    public class ResolveComplaintDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string ResolutionNotes { get; set; } = null!;

        public bool NotifyCustomer { get; set; } = true;
    }

    public class EscalateToAdminDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string EscalationReason { get; set; } = null!;
    }
}
