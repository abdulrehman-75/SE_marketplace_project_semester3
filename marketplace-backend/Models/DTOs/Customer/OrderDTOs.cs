using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Customer
{
    public class CreateOrderDto
    {
        [Required]
        [MaxLength(300)]
        public string DeliveryAddress { get; set; } = null!;

        [MaxLength(100)]
        public string? DeliveryCity { get; set; }

        [MaxLength(20)]
        public string? DeliveryPostalCode { get; set; }

        [Required]
        [MaxLength(20)]
        public string CustomerPhone { get; set; } = null!;
    }

    public class CustomerOrderDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal BuyerProtectionFee { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string? CustomerPhone { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? VerificationPeriodEnd { get; set; }
        public bool CustomerConfirmedReceipt { get; set; }
        public bool CustomerReportedProblem { get; set; }
        public int TotalItems { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
    }

    public class OrderTrackingDto
    {
        public int OrderId { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? VerificationPeriodEnd { get; set; }

        // Existing action flags
        public bool CanConfirmReceipt { get; set; }
        public bool CanReportProblem { get; set; }

        // ✅ NEW: Cancellation capability flag
        public bool CanCancel { get; set; }

        public string? DeliveryStaffName { get; set; }
        public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
    }

    public class OrderStatusHistoryDto
    {
        public string Status { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Description { get; set; } = null!;
    }

    public class ConfirmReceiptDto
    {
        [Required]
        public int OrderId { get; set; }
    }

    public class ReportProblemDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string ProblemDescription { get; set; } = null!;
    }
        /// <summary>
        /// DTO for customer order cancellation request
        /// </summary>
        public class CancelOrderDto
        {
            [Required(ErrorMessage = "Cancellation reason is required")]
            [MaxLength(500, ErrorMessage = "Cancellation reason cannot exceed 500 characters")]
            [MinLength(10, ErrorMessage = "Please provide a detailed reason (at least 10 characters)")]
            public string CancellationReason { get; set; } = null!;
        }

        /// <summary>
        /// Response DTO for cancelled order
        /// </summary>
        public class CancelOrderResponseDto
        {
            public int OrderId { get; set; }
            public DateTime CancelledDate { get; set; }
            public string CancellationReason { get; set; } = null!;
            public decimal RefundAmount { get; set; }
            public List<RestoredStockDto> RestoredItems { get; set; } = new();
        }

        /// <summary>
        /// Details of restored stock items after cancellation
        /// </summary>
        public class RestoredStockDto
        {
            public int ProductId { get; set; }
            public string ProductName { get; set; } = null!;
            public int Quantity { get; set; }
        }
}
