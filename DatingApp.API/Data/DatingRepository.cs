using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
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

        public async Task<Like> GetLike(int UserId, int RecipientId)
        {
            return await _contect.Likes.FirstOrDefaultAsync(l => l.LikerId == UserId && l.LikeeId == RecipientId);
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

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = _contect.Users.Include(s => s.Photos)
                .OrderByDescending(d => d.LastActive).AsQueryable();

            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if(userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if(userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }
                
            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Now.AddYears(-userParams.MinAge - 1);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(d => d.Created);
                        break;

                    default:
                        users = users.OrderByDescending(d => d.LastActive);
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {   
            var user = await _contect.Users
                .Include(x => x.Likers)
                .Include(x => x.Likees)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(x => x.LikerId);
            }
            else 
            {
                return user.Likees.Where(u => u.LikerId == id).Select(x => x.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await _contect.SaveChangesAsync() > 0;
        }
    }
}