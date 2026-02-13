using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models
{
    public class SystemConfiguration
    {
        [Key]
        public int ConfigId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ConfigKey { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string ConfigValue { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }
}
