using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Customer
{
    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CartDto
    {
        public int CartId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal BuyerProtectionFee { get; set; }
        public decimal GrandTotal { get; set; }
        public int TotalItems { get; set; }
    }

    public class CartItemDto
    {
        public int CartItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
    }
}
