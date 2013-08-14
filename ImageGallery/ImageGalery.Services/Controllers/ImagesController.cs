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
    public class ImagesController : ApiController
    {
        private ImageGalleryContext db = new ImageGalleryContext();

        public ImagesController()
        {
            db.Configuration.ProxyCreationEnabled = false;
        }

        // GET api/Images
        public IEnumerable<Image> GetImages()
        {
            return db.Images.AsEnumerable();
        }

        // GET api/Images/5
        public Image GetImage(int id)
        {
            Image image = db.Images.Find(id);
            if (image == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return image;
        }

        // PUT api/Images/5
        public HttpResponseMessage PutImage(int id, Image image)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != image.ImageId)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(image).State = EntityState.Modified;

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

        // POST api/Images
        public HttpResponseMessage PostImage(Image image)
        {
            if (ModelState.IsValid)
            {
                db.Images.Add(image);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, image);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = image.ImageId }));
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        // DELETE api/Images/5
        public HttpResponseMessage DeleteImage(int id)
        {
            Image image = db.Images.Find(id);
            if (image == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Images.Remove(image);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, image);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}