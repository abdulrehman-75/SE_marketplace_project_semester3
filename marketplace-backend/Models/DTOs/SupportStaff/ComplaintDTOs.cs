using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.SupportStaff
{
    public class ComplaintListDto
    {
        public int ComplaintId { get; set; }
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string ComplaintType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public DateTime DateReported { get; set; }
        public int? AssignedSupportStaffId { get; set; }
        public string? AssignedStaffName { get; set; }
        public bool IsAssignedToMe { get; set; }
        public string ShortDescription { get; set; } = null!;
    }

    public class ComplaintDetailDto
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

        // Customer Info
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }

        // Assignment Info
        public int? AssignedSupportStaffId { get; set; }
        public string? AssignedStaffName { get; set; }

        // Order Info
        public ComplaintOrderDto Order { get; set; } = null!;

        // Conversation
        public List<ComplaintConversationDto> Conversation { get; set; } = new();
    }

    public class ComplaintOrderDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public DateTime? DeliveryDate { get; set; }
        public string? ProblemDescription { get; set; }
        public List<ComplaintOrderItemDto> OrderItems { get; set; } = new();

        // Seller Info (from order items)
        public List<ComplaintSellerInfoDto> Sellers { get; set; } = new();
    }

    public class ComplaintOrderItemDto
    {
        public int OrderItemId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
    }

    public class ComplaintSellerInfoDto
    {
        public int SellerId { get; set; }
        public string ShopName { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public decimal OverallRating { get; set; }
    }

    public class ComplaintConversationDto
    {
        public int MessageId { get; set; }
        public string SenderType { get; set; } = null!; // System, Customer, SupportStaff
        public string SenderName { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public bool IsInternal { get; set; } // Internal notes visible only to staff
    }
    public class DeEscalateComplaintDto
    {
        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string DeEscalationNotes { get; set; } = null!;

        public bool ReassignToMe { get; set; } = true;
    }
}
