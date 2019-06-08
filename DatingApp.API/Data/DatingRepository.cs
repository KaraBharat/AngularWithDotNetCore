using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _contect;
        public DatingRepository(DataContext contect)
        {
            _contect = contect;
        }

        public void Add<T>(T entity) where T : class
        {
            _contect.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _contect.Remove(entity);
        }

        public async Task<Photo> GetMainPhoto(int UserId)
        {
            return await _contect.Photos.Where(s => s.UserId == UserId).FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int Id)
        {
            var photo = await _contect.Photos.FirstOrDefaultAsync(p => p.Id == Id);

            return photo;
        }

        public async Task<User> GetUser(int Id)
        {
            var user = await _contect.Users.Include(s => s.Photos).FirstOrDefaultAsync(u => u.Id == Id);

            return user;
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = await _contect.Users.Include(s => s.Photos).ToListAsync();

            return users;
        }

        public async Task<bool> SaveAll()
        {
            return await _contect.SaveChangesAsync() > 0;
        }
    }
}