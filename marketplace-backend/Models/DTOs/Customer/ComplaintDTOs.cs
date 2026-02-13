using System.ComponentModel.DataAnnotations;
using MarketPlace.Models.DTOs.Common;

namespace MarketPlace.Models.DTOs.Customer
{
    // ================== COMPLAINT VIEWING ==================

    /// <summary>
    /// Customer's view of their complaints list
    /// </summary>
    public class CustomerComplaintListDto
    {
        public int ComplaintId { get; set; }
        public int OrderId { get; set; }
        public string ComplaintType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public DateTime DateReported { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public bool IsAssigned { get; set; }
        public string? AssignedStaffName { get; set; }
        public string ShortDescription { get; set; } = null!;
        public int UnreadMessagesCount { get; set; }
    }

    /// <summary>
    /// Customer's detailed view of a complaint with conversation
    /// </summary>
    public class CustomerComplaintDetailDto
    {
        public int ComplaintId { get; set; }
        public int OrderId { get; set; }
        public string ComplaintType { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public DateTime DateReported { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? ResolutionNotes { get; set; }
        public string? AttachedImages { get; set; }

        // Assignment Info (simplified for customer)
        public bool IsAssigned { get; set; }
        public string? AssignedStaffName { get; set; }

        // Order Summary
        public CustomerComplaintOrderDto Order { get; set; } = null!;

        // Conversation Thread
        public List<CustomerComplaintMessageDto> Conversation { get; set; } = new();

        // Actions Available
        public bool CanReply { get; set; }
    }

    /// <summary>
    /// Simplified order info for customer's complaint view
    /// </summary>
    public class CustomerComplaintOrderDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public List<CustomerComplaintOrderItemDto> OrderItems { get; set; } = new();
    }

    /// <summary>
    /// Order item in customer's complaint view
    /// </summary>
    public class CustomerComplaintOrderItemDto
    {
        public int OrderItemId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public string SellerShopName { get; set; } = null!;
    }

    /// <summary>
    /// Message in complaint conversation (customer view - excludes internal messages)
    /// </summary>
    public class CustomerComplaintMessageDto
    {
        public int MessageId { get; set; }
        public string SenderType { get; set; } = null!; // System, Customer, SupportStaff
        public string SenderName { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime Timestamp { get; set; }
    }

    // ================== COMPLAINT ACTIONS ==================

    /// <summary>
    /// Create a new complaint
    /// </summary>
    public class CreateComplaintDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ComplaintType { get; set; } = null!; // ProductQuality, PaymentDispute, etc.

        [Required]
        [MinLength(20, ErrorMessage = "Please provide a detailed description (at least 20 characters)")]
        [MaxLength(2000)]
        public string Description { get; set; } = null!;

        [MaxLength(500)]
        public string? AttachedImages { get; set; } // Comma-separated file paths
    }

    /// <summary>
    /// Reply to an existing complaint
    /// </summary>
    public class ReplyToComplaintDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MinLength(10, ErrorMessage = "Message must be at least 10 characters")]
        [MaxLength(2000)]
        public string Message { get; set; } = null!;
    }

    /// <summary>
    /// Filter parameters for customer's complaints
    /// </summary>
    public class CustomerComplaintFilterParams : PaginationParams
    {
        public string? Status { get; set; } // Open, InProgress, Resolved, Closed, Escalated
        public string? ComplaintType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}