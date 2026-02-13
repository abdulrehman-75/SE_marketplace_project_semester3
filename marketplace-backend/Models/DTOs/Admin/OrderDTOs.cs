namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminOrderListDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public int TotalItems { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public bool CustomerReportedProblem { get; set; }
        public int? DeliveryStaffId { get; set; }
        public string? DeliveryStaffName { get; set; }
    }

    public class AdminOrderDetailDto : AdminOrderListDto
    {
        public decimal TotalAmount { get; set; }
        public decimal BuyerProtectionFee { get; set; }
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string? DeliveryPostalCode { get; set; }
        public string? CustomerPhone { get; set; }
        public DateTime? VerificationPeriodStart { get; set; }
        public DateTime? VerificationPeriodEnd { get; set; }
        public bool CustomerConfirmedReceipt { get; set; }
        public string? ProblemDescription { get; set; }
        public int? AssignedSupportStaffId { get; set; }
        public string? AssignedSupportStaffName { get; set; }
        public string? AdminNotes { get; set; }
        public List<AdminOrderItemDto> OrderItems { get; set; } = new();
        public List<PaymentVerificationSummaryDto> PaymentVerifications { get; set; } = new();
    }

    public class AdminOrderItemDto
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
    namespace MarketPlace.Models.DTOs.Admin
    {
        public class AdminConfirmOrderDto
        {
            public string Reason { get; set; } = null!;
            public bool NotifySellers { get; set; } = true;
            public bool NotifyCustomer { get; set; } = true;
            public int? SpecificSellerId { get; set; }
        }
    }
}
