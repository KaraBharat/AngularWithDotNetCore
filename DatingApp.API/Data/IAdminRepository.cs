using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IAdminRepository
    {
        void Delete<T>(T entity) where T : class;
        Task<List<UsersWithRolesDto>> GetUsersWithRoles();
        Task<List<PhotosForModerationsDto>> GetPhotosForModeration();
        Task<Photo> GetPhoto(int Id);
        Task<bool> SaveAll();
    }
}