namespace MarketPlace.Models.DTOs.SupportStaff
{
    public class SupportStaffStatsDto
    {
        public int TotalCasesHandled { get; set; }
        public int ActiveCases { get; set; }
        public int ResolvedCases { get; set; }
        public int EscalatedCases { get; set; }
        public int TodaysCases { get; set; }
        public decimal ResolutionRate { get; set; }
        public ComplaintsByStatusDto ComplaintsByStatus { get; set; } = new();
        public ComplaintsByPriorityDto ComplaintsByPriority { get; set; } = new();
    }

    public class ComplaintsByStatusDto
    {
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
        public int Closed { get; set; }
        public int Escalated { get; set; }
    }

    public class ComplaintsByPriorityDto
    {
        public int Low { get; set; }
        public int Medium { get; set; }
        public int High { get; set; }
        public int Urgent { get; set; }
    }
    // Filter DTO
    public class ComplaintFilterParams : Common.PaginationParams
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public bool? AssignedToMe { get; set; }
        public bool? Unassigned { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? ComplaintType { get; set; }
    }
}
