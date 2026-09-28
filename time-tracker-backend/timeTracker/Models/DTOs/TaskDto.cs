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
        public int Order { get; set; }
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

    // Body for PUT /api/Task/reorder: the full, final ordering of tasks within a
    // single state column after a drag-and-drop (whether reordered in place or
    // moved in from another column).
    public class ReorderTasksDto
    {
        public int StateID { get; set; }
        public List<int> TaskIds { get; set; } = new();
    }
}
