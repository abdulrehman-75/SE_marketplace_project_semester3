using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class SystemConfigDto
    {
        public int ConfigId { get; set; }
        public string ConfigKey { get; set; } = null!;
        public string ConfigValue { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime LastUpdated { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class UpdateSystemConfigDto
    {
        [Required]
        public int ConfigId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ConfigValue { get; set; } = null!;
    }
}
