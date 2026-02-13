namespace MarketPlace.Models.DTOs.SupportStaff
{
    public class CustomerOrderHistoryDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public List<CustomerOrderSummaryDto> Orders { get; set; } = new();
    }

    public class CustomerOrderSummaryDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal GrandTotal { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public bool HasComplaint { get; set; }
        public int TotalItems { get; set; }
    }
}
