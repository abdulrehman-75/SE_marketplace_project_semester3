namespace MarketPlace.Models
{
    public class SellerOrderConfirmation
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int SellerId { get; set; }
        public DateTime ConfirmedAt { get; set; }

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Seller Seller { get; set; } = null!;
    }
}
