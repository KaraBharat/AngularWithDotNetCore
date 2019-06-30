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
        private readonly DataContext _context;
        public DatingRepository(DataContext contect)
        {
            _context = contect;
        }

        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<Like> GetLike(int UserId, int RecipientId)
        {
            return await _context.Likes.FirstOrDefaultAsync(l => l.LikerId == UserId && l.LikeeId == RecipientId);
        }

        public async Task<Photo> GetMainPhoto(int UserId)
        {
            return await _context.Photos.Where(s => s.UserId == UserId).FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int Id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(p => p.Id == Id);

            return photo;
        }

        public async Task<User> GetUser(int Id)
        {
            var user = await _context.Users.Include(s => s.Photos).FirstOrDefaultAsync(u => u.Id == Id);

            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = _context.Users.Include(s => s.Photos)
                .OrderByDescending(d => d.LastActive).AsQueryable();

            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
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
            var user = await _context.Users
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
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Message> GetMessage(int Id)
        {
            return await _context.Messages
                .Include(s => s.Sender)
                .ThenInclude(p => p.Photos)
                .Include(s => s.Recipient)
                .ThenInclude(p => p.Photos)
                .FirstOrDefaultAsync(m => m.Id == Id);
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages
                .Include(s => s.Sender)
                .ThenInclude(p => p.Photos)
                .Include(s => s.Recipient)
                .ThenInclude(p => p.Photos)
                .AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId && u.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.IsRead == false && u.RecipientDeleted == false);
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessageThread(int UserId, int RecipientId)
        {
            var messages = await _context.Messages
                .Include(s => s.Sender)
                .ThenInclude(p => p.Photos)
                .Include(s => s.Recipient)
                .ThenInclude(p => p.Photos)
                .Where(u => 
                    (u.SenderId == UserId && u.RecipientId == RecipientId && u.SenderDeleted == false) 
                    || 
                    (u.RecipientId == UserId && u.SenderId == RecipientId && u.RecipientDeleted == false)
                )
                .OrderByDescending(d => d.MessageSent)
                .ToListAsync();

            return messages;
        }

        public async Task<int> GetUnreadMessages(int UserId)
        {
            var messages = await _context.Messages
                .Where(u => u.RecipientId == UserId && u.RecipientDeleted == false &&  u.IsRead == false)
                .CountAsync();

            return messages;
        }
    }
}