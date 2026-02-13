using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.DeliveryStaff
{
    public class DeliveryStaffProfileDto
    {
        public int DeliveryStaffId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleNumber { get; set; }
        public string? LicenseNumber { get; set; }
        public string? AssignedArea { get; set; }
        public string? CurrentLocation { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateJoined { get; set; }
        public int TotalDeliveries { get; set; }
        public int SuccessfulDeliveries { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class UpdateDeliveryStaffProfileDto
    {
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(50)]
        public string? VehicleType { get; set; }

        [MaxLength(50)]
        public string? VehicleNumber { get; set; }

        [MaxLength(100)]
        public string? LicenseNumber { get; set; }

        [MaxLength(200)]
        public string? CurrentLocation { get; set; }
    }

    public class UpdateAvailabilityDto
    {
        [Required]
        public bool IsAvailable { get; set; }

        [MaxLength(200)]
        public string? CurrentLocation { get; set; }
    }
}
