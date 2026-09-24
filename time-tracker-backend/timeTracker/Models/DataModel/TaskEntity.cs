using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace timeTracker.Models.DataModel
{
    [Table("Tasks")]
    public class TaskEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public int? ParentID { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime Start { get; set; }

        public DateTime? End { get; set; }

        public TimeSpan? TimeTaken { get; set; }

        public int StateID { get; set; }

        [ForeignKey("ParentID")]
        public TaskEntity? Parent { get; set; }

        [ForeignKey("StateID")]
        public State? State { get; set; }
    }
}
