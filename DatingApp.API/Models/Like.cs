using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace DatingApp.API.Models
{
    public class Like
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        public int LikerId { get; set; }
        public int LikeeId { get; set; }

        public User Liker { get; set; }
        public User Likee { get; set; }

        public DateTime LikedOn { get; set; }
    }
}