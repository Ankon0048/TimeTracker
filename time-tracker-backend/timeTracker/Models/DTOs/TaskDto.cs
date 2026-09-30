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

    // Body for PATCH /api/Task/{id}. Every field is optional; only fields present
    // in the request are applied.
    public class UpdateTaskDto
    {
        private int? _parentId;

        // "parentID": null means "make this a top-level task", while omitting the
        // field leaves the parent unchanged. System.Text.Json only calls the setter
        // for properties present in the JSON, which is how the two are told apart.
        public int? ParentID
        {
            get => _parentId;
            set
            {
                _parentId = value;
                ParentIDSpecified = true;
            }
        }

        [System.Text.Json.Serialization.JsonIgnore]
        public bool ParentIDSpecified { get; private set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? Start { get; set; }
        public DateTime? End { get; set; }
        public TimeSpan? TimeTaken { get; set; }
        public int? StateID { get; set; }
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
