using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUsers(UserParams userParams);
        Task<User> GetUser(int Id, bool isCucrrentUser);
        Task<Photo> GetPhoto(int Id);
        Task<Photo> GetMainPhoto(int UserId);
        Task<Like> GetLike(int UserId, int RecipientId);
        Task<Message> GetMessage(int Id);
        Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessageThread(int UserId, int RecipientId);
        Task<int> GetUnreadMessages(int UserId);
    }
}