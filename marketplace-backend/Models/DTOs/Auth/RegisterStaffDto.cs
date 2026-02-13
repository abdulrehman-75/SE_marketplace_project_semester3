using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Auth
{
    // Base DTO for all staff types
    public class RegisterStaffDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = null!;

        [MaxLength(50)]
        public string? EmployeeCode { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }
    }

    // Admin specific
    public class RegisterAdminDto : RegisterStaffDto
    {
        // Admin uses base properties
    }

    // Delivery Staff specific
    public class RegisterDeliveryStaffDto : RegisterStaffDto
    {
        [MaxLength(50)]
        public string? VehicleType { get; set; }

        [MaxLength(50)]
        public string? VehicleNumber { get; set; }

        [MaxLength(100)]
        public string? LicenseNumber { get; set; }

        [MaxLength(150)]
        public string? AssignedArea { get; set; }
    }

    // Support Staff specific
    public class RegisterSupportStaffDto : RegisterStaffDto
    {
        [MaxLength(150)]
        public string? Specialization { get; set; }
    }

    // Inventory Manager specific
    public class RegisterInventoryManagerDto : RegisterStaffDto
    {
        [MaxLength(100)]
        public string? AssignedWarehouse { get; set; }
    }
}