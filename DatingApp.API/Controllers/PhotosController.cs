using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinoryConfig;
        private Cloudinary _cloudinory;

        public PhotosController(IDatingRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinoryConfig)
        {
            _cloudinoryConfig = cloudinoryConfig;
            _mapper = mapper;
            _repo = repo;

            Account acc = new Account(
                _cloudinoryConfig.Value.CloudName,
                _cloudinoryConfig.Value.APIKey,
                _cloudinoryConfig.Value.APISecret
            );

            _cloudinory = new Cloudinary(acc);
        }

        [HttpGet("{id}", Name="GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await _repo.GetPhoto(id);

            var photo = _mapper.Map<PhotosForReturnDto>(photoFromRepo);

            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int UserId, [FromForm]PhotosForCreationDto photo) 
        {
            if(UserId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }

            if(photo.File == null) {
                return BadRequest();
            }

            var userFromRepo = await _repo.GetUser(UserId, true);

            var file = photo.File;

            var uploadResult = new ImageUploadResult();

            if(file.Length > 0) 
            {
                using(var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = _cloudinory.Upload(uploadParams);
                }    

            }

            photo.Url = uploadResult.Uri.ToString();
            photo.PublicId = uploadResult.PublicId;

            var photoForSave = _mapper.Map<Photo>(photo);

            if(!userFromRepo.Photos.Any(p => p.IsMain))
            {
                photoForSave.IsMain = true;
            }

            userFromRepo.Photos.Add(photoForSave);

            if(await _repo.SaveAll()) 
            {
                var photoToReturn = _mapper.Map<PhotosForReturnDto>(photoForSave);

                return CreatedAtRoute("GetPhoto", new { id = photoForSave.Id }, photoToReturn); 
            }

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int UserId, int Id) 
        {
            
            if(UserId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }

            var userFromRepo = await _repo.GetUser(UserId,true);

            if(!userFromRepo.Photos.Any(p => p.Id == Id))
            {
                return Unauthorized();
            }

            var photoFromRepo = await _repo.GetPhoto(Id);

            if(photoFromRepo.IsMain) {
                return BadRequest("This is already the main photo");    
            }

            var mainPhotoFromRepo = await _repo.GetMainPhoto(UserId);

            mainPhotoFromRepo.IsMain = false;
            photoFromRepo.IsMain = true;

            if(await _repo.SaveAll())
            {
                return NoContent();
            }

            return BadRequest("Photo could not set to main");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int UserId, int Id) 
        {
            if(UserId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }

            var userFromRepo = await _repo.GetUser(UserId, true);

            if(!userFromRepo.Photos.Any(p => p.Id == Id))
            {
                return Unauthorized();
            }

            var photoFromRepo = await _repo.GetPhoto(Id);

            if(photoFromRepo.IsMain) {
                return BadRequest("You can not delete your main photo");
            }

            if(!string.IsNullOrEmpty(photoFromRepo.PublicId))
            {
                var deleteParams = new DeletionParams(photoFromRepo.PublicId);
                
                var result = _cloudinory.Destroy(deleteParams);

                if(result.Result == "ok")
                {
                    _repo.Delete(photoFromRepo);
                }
            }
            else
            {
                _repo.Delete(photoFromRepo);
            }

            if(await _repo.SaveAll())
            {
                return Ok();
            }

            return BadRequest("Photo could not deleted");
        }
    }
}