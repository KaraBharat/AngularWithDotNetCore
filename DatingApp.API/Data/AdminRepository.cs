using System.Threading.Tasks;
using DatingApp.API.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using DatingApp.API.Dtos;

namespace DatingApp.API.Data
{
    public class AdminRepository : IAdminRepository
    {
        private readonly DataContext _context;
        public AdminRepository(DataContext context)
        {
            _context = context;
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<List<UsersWithRolesDto>> GetUsersWithRoles()
        {
            var userList = await (
                from user in _context.Users orderby user.UserName
                select new UsersWithRolesDto 
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain == true).Url,
                    Roles = (
                        from userRole in user.UserRoles
                        join role in _context.Roles
                        on userRole.RoleId equals role.Id
                        select role.Name
                    ).ToList()
                }).ToListAsync();


            return userList;
        }

        public async Task<List<PhotosForModerationsDto>> GetPhotosForModeration()
        {
            var photos = await _context.Photos
                .IgnoreQueryFilters()
                .Where(p => p.IsApproved == false)
                .Select(x => new PhotosForModerationsDto {
                    Id = x.Id,
                    UserName =x.User.UserName,
                    Url = x.Url,
                    IsApproved = x.IsApproved
                }).ToListAsync();

            return photos;
        }

        public async Task<Photo> GetPhoto(int Id)
        {
            return await _context.Photos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == Id);
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}