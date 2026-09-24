namespace timeTracker.Models.DTOs
{
    public class TaskDto
    {
        public int ID { get; set; }
        public int? ParentID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public DateTime? End { get; set; }
        public TimeSpan? TimeTaken { get; set; }
        public int StateID { get; set; }
    }

    public class CreateTaskDto
    {
        public int? ParentID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public DateTime? End { get; set; }
        public TimeSpan? TimeTaken { get; set; }
        public int? ProjectID { get; set; }
    }
}
