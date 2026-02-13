namespace MarketPlace.Models.DTOs.DeliveryStaff
{
    public class DeliveryStatsDto
    {
        public int TotalDeliveries { get; set; }
        public int SuccessfulDeliveries { get; set; }
        public int PendingDeliveries { get; set; }
        public int TodaysDeliveries { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal TotalAmountDelivered { get; set; }
    }

    // Filter DTOs
    public class DeliveryFilterParams : Common.PaginationParams
    {
        public string? OrderStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? City { get; set; }
    }
}
