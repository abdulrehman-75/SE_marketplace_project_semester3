namespace MarketPlace.Models.DTOs.Seller
{
    public class SellerFollowerResponseDto
    {
        public int FollowerId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public DateTime DateFollowed { get; set; }
        public bool NotificationsEnabled { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
    }
}
