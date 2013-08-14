using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using ImageGallery.Models;
using ImageGallery.DataLayer;

namespace ImageGalery.Services.Controllers
{
    public class UsersController : ApiController
    {
        private ImageGalleryContext db = new ImageGalleryContext();

        // GET api/Users
        public HttpResponseMessage GetUsers()
        {
            var data = (from users in db.Users
                        select new
                        {
                            UserId = users.UserId,
                            Username = users.Username
                        }).ToList();

            return Request.CreateResponse(HttpStatusCode.OK, data);
        }

        // GET api/Users/5
        public HttpResponseMessage GetUser(int id)
        {
            
            var galleries = (from albums in db.Albums
                             where (albums.User.UserId == id /*&& albums.Albums == null*/)
                             select new
                             {
                                 AlbumId = albums.AlbumId,
                                 Title = albums.Title
                             }).ToList();
            var user = db.Users.Find(id);

            if (user != null)
            {
                var data = new
                            {
                                UserId = user.UserId,
                                Username = user.Username,
                                Galleries = galleries
                            };

                return Request.CreateResponse(HttpStatusCode.OK, data);
            }

            return Request.CreateResponse(HttpStatusCode.NotFound);
        }

        // PUT api/Users/5
        public HttpResponseMessage PutUser(int id, User user)
        {
            if (ModelState.IsValid && id == user.UserId)
            {
                db.Entry(user).State = EntityState.Modified;

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // POST api/Users
        public HttpResponseMessage PostUser(User user)
        {
            if (ModelState.IsValid)
            {
                db.Users.Add(user);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, user);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = user.UserId }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Users/5
        public HttpResponseMessage DeleteUser(int id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Users.Remove(user);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, user);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}