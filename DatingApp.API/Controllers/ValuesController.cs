using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private DataContext _dbContext;

        public ValuesController(DataContext context)
        {
            this._dbContext = context;
        }

        // GET api/values
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var values = await this._dbContext.Values.ToListAsync();

            return Ok(values);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var value = await this._dbContext.Values.Where(v => v.Id == id).FirstOrDefaultAsync();

            if (value == null)
                return BadRequest("Value not found");

            return Ok(value);
        }

        // POST api/values
        [HttpPost]
        public async Task<IActionResult> Post(Value value)
        {
            await this._dbContext.Values.AddAsync(value);
            this._dbContext.SaveChanges();

            return Ok("Value saved successfully");
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Value val, int id)
        {
            var value = await this._dbContext.Values.Where(v => v.Id == id).FirstOrDefaultAsync();

            if (value == null)
                return BadRequest("Value not found");

            value.Name = val.Name;

            this._dbContext.SaveChanges();

            return Ok("Value updated successfully");
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var value = await this._dbContext.Values.Where(v => v.Id == id).FirstOrDefaultAsync();

            if (value == null)
                return BadRequest("Value not found");

            this._dbContext.Values.Remove(value);

            this._dbContext.SaveChanges();

            return Ok("Value deleted successfully");
        }
    }
}
