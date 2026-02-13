namespace MarketPlace.Models.DTOs.Seller
{
    public class SellerOrderResponseDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public decimal GrandTotal { get; set; }

        // Customer Details
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string CustomerPhone { get; set; } = null!;
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string? DeliveryPostalCode { get; set; }

        // Delivery Info
        public DateTime? DeliveryDate { get; set; }
        public DateTime? VerificationPeriodEnd { get; set; }
        public bool CustomerConfirmedReceipt { get; set; }
        public bool CustomerReportedProblem { get; set; }

        // Order Items
        public List<OrderItemInOrderDto> AllOrderItems { get; set; } = new();
        public List<OrderItemInOrderDto> MyOrderItems { get; set; } = new();

        // Financial breakdown for seller
        public decimal MyItemsSubtotal { get; set; }
        public int MyItemsCount { get; set; }
    }

    public class OrderItemInOrderDto
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
        public bool IsMyProduct { get; set; }
    }
}
