using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.DeliveryStaff
{
    public class AvailableOrderDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string? CustomerPhone { get; set; }
        public string CustomerName { get; set; } = null!;
        public int TotalItems { get; set; }
        public bool IsCOD { get; set; }
    }

    public class AssignedOrderDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal BuyerProtectionFee { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;

        // Delivery Info
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string? DeliveryPostalCode { get; set; }
        public string? CustomerPhone { get; set; }
        public DateTime? DeliveryDate { get; set; }

        // Customer Info
        public string CustomerName { get; set; } = null!;
        public int TotalItems { get; set; }

        // Order Items
        public List<DeliveryOrderItemDto> OrderItems { get; set; } = new();
    }

    public class DeliveryOrderItemDto
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public string SellerShopName { get; set; } = null!;
    }

    public class DeliveryHistoryDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string DeliveryAddress { get; set; } = null!;
        public string? DeliveryCity { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerPhone { get; set; }
        public int TotalItems { get; set; }
        public bool WasSuccessful { get; set; }
    }
    public class UnassignOrderDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(500)]
        public string UnassignReason { get; set; } = null!;
    }
}
