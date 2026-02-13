using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.SupportStaff
{
    public class SupportStaffProfileDto
    {
        public int SupportStaffId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string EmployeeCode { get; set; } = null!;
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public string? Specialization { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateJoined { get; set; }
        public int TotalCasesHandled { get; set; }
        public int ActiveCases { get; set; }
    }

    public class UpdateSupportStaffProfileDto
    {
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Specialization { get; set; }
    }
}
