using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace timeTracker.Models.DataModel
{
    [Table("ProjectTasks")]
    public class ProjectTask
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public int ProjectID { get; set; }

        public int TaskID { get; set; }

        [ForeignKey("ProjectID")]
        public Project? Project { get; set; }

        [ForeignKey("TaskID")]
        public TaskEntity? Task { get; set; }
    }
}
