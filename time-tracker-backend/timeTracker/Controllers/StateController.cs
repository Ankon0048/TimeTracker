using Microsoft.AspNetCore.Mvc;
using timeTracker.Models.DTOs;
using timeTracker.Services.Interfaces;

namespace timeTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StateController : ControllerBase
    {
        private readonly IStateService _stateService;

        public StateController(IStateService stateService)
        {
            _stateService = stateService;
        }

        [HttpPost]
        public async Task<ActionResult<StateDto>> CreateState(CreateStateDto dto)
        {
            var result = await _stateService.CreateStateAsync(dto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StateDto>>> GetAllStates()
        {
            var result = await _stateService.GetAllStatesAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<StateDto>> UpdateState(int id, CreateStateDto dto)
        {
            var result = await _stateService.UpdateStateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteState(int id)
        {
            var result = await _stateService.DeleteStateAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
