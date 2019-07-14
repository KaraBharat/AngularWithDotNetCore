using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _repo;
        private readonly UserManager<User> _userManager;

        private readonly IOptions<CloudinarySettings> _cloudinoryConfig;
        private Cloudinary _cloudinory;
        
        public AdminController(IAdminRepository repo, UserManager<User> userManager, IOptions<CloudinarySettings> cloudinoryConfig)
        {
            _userManager = userManager;
            _cloudinoryConfig = cloudinoryConfig;
            _repo = repo;

            Account acc = new Account(
                _cloudinoryConfig.Value.CloudName,
                _cloudinoryConfig.Value.APIKey,
                _cloudinoryConfig.Value.APISecret
            );

            _cloudinory = new Cloudinary(acc);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
        {
            var userList = await _repo.GetUsersWithRoles();

            return Ok(userList);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditRoles(string userName, RoleEditDto roleEditDto)
        {
            var user = await _userManager.FindByNameAsync(userName);

            if(user == null)
            {
                return BadRequest("User does not exists");
            }

            var userRole = await _userManager.GetRolesAsync(user);

            var selectedRole = roleEditDto.RoleNames;

            selectedRole = selectedRole ?? new string[] { };

            var result = await _userManager.AddToRolesAsync(user, selectedRole.Except(userRole));

            if(!result.Succeeded)
            {
                return BadRequest("failed to add the roles");
            }

            result = await _userManager.RemoveFromRolesAsync(user, userRole.Except(selectedRole));

            if(!result.Succeeded)
            {
                return BadRequest("failed to remove the roles");
            }

            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
             var photos = await _repo.GetPhotosForModeration();

            return Ok(photos);
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("approvePhoto/{photoId}")]
        public async Task<IActionResult> ApprovePhoto(int photoId)
        {
            var photo = await _repo.GetPhoto(photoId);

            photo.IsApproved = true;

            await _repo.SaveAll();

            return Ok();
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("rejectPhoto/{photoId}")]
        public async Task<IActionResult> RejectPhoto(int photoId)
        {
            var photo = await _repo.GetPhoto(photoId);

            if(photo.IsMain)
            {
                return BadRequest("You can not reject the main photo");
            }

            if(photo.PublicId != null) 
            {
                var deleteParams = new DeletionParams(photo.PublicId);

                var result = _cloudinory.Destroy(deleteParams);

                if(result.Result == "ok")
                {
                    _repo.Delete(photo);
                }
            }
            else
            {
                _repo.Delete(photo);
            }

            await _repo.SaveAll();

            return Ok();
        }
    }
}