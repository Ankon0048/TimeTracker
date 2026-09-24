using timeTracker.Models.DTOs;

namespace timeTracker.Services.Interfaces
{
    public interface IStateService
    {
        Task<StateDto> CreateStateAsync(CreateStateDto dto);
        Task<StateDto?> UpdateStateAsync(int id, CreateStateDto dto);
        Task<bool> DeleteStateAsync(int id);
        Task<IEnumerable<StateDto>> GetAllStatesAsync();
    }
}
