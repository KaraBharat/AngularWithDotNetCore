namespace DatingApp.API.Dtos
{
    public class PhotosForModerationsDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Url { get; set; }
        public bool IsApproved { get; set; }
    }
}