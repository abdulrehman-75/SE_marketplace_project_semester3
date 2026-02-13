using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.DeliveryStaff
{
    public class SelfAssignOrderDto
    {
        [Required]
        public int OrderId { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; } = null!; // PickedUp, OnTheWay, Delivered
    }

    public class MarkAsDeliveredDto
    {
        [Required]
        public int OrderId { get; set; }

        [MaxLength(500)]
        public string? DeliveryNotes { get; set; }
    }
}
