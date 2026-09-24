using Microsoft.AspNetCore.Mvc;
using timeTracker.Models.DTOs;
using timeTracker.Services.Interfaces;

namespace timeTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto dto)
        {
            try
            {
                var result = await _taskService.CreateTaskAsync(dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks()
        {
            var result = await _taskService.GetAllTasksAsync();
            return Ok(result);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<TaskDto>> UpdateTask(int id, TaskDto dto)
        {
            var result = await _taskService.UpdateTaskAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTask(int id)
        {
            var result = await _taskService.DeleteTaskAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("parent/{projectId}")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetParentTasks(int projectId)
        {
            var result = await _taskService.GetParentTasksAsync(projectId);
            return Ok(result);
        }

        [HttpGet("nested/{parentTaskId}")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetNestedTasks(int parentTaskId)
        {
            var result = await _taskService.GetNestedTasksAsync(parentTaskId);
            return Ok(result);
        }
    }
}
