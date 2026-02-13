using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

    }

    public class UpdateCategoryDto
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }

    public class CategoryWithStatsDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string? Description { get; set; }
        public string? CategoryImage { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateCreated { get; set; }
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
    }
}
