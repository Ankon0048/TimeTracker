namespace timeTracker.Models.DTOs
{
    public class StateDto
    {
        public int ID { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateStateDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
