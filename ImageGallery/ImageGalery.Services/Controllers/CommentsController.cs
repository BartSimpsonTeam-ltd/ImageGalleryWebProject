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
    public class CommentsController : ApiController
    {
        private ImageGalleryContext db = new ImageGalleryContext();
        public CommentsController()
        {
            db.Configuration.ProxyCreationEnabled = false;
        }
       

        // GET api/Comments/5
        public HttpResponseMessage GetComment(int id)
        {
            var image = db.Images.FirstOrDefault(x => x.ImageId == id);

            var comments = db.Comments.Where(x => x.ImageId == id).Select(y=> new {
                CommentId=y.CommentId,
                Content=y.Content,
                Username=y.User.Username,
                ImageId = y.ImageId
            }).ToList();

            if (image == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return Request.CreateResponse(HttpStatusCode.OK, comments);
        }

        // PUT api/Comments/5
        public HttpResponseMessage PutComment(int id, Comment comment)
        {
            //Check isLoggedIn
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != comment.CommentId)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(comment).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // POST api/Comments
        public HttpResponseMessage PostComment(Comment comment)
        {
            //Check isLoggedIn
            if (ModelState.IsValid)
            {
                db.Comments.Add(comment);
                db.SaveChanges();
               
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, comment);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = comment.CommentId }));
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        // DELETE api/Comments/5
        public HttpResponseMessage DeleteComment(int id)
        {
            //Check isLoggedIn
            Comment comment = db.Comments.Find(id);
            if (comment == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Comments.Remove(comment);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, comment);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}