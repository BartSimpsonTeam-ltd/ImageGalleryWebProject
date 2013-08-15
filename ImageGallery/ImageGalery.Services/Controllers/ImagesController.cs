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
using ImageGallery.Models;
using System.Threading.Tasks;
using System.Diagnostics;
using ImageGalery.Services.Persisters;
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

        public HttpResponseMessage GetImage(int id)
        {
            var comments = (from comment in db.Comments
                            where (comment.Image.ImageId == id)
                            select new
                            {
                                Content = comment.Content,
                                Username = comment.User.Username
                            }).ToList();
            var image = db.Images.Find(id);

            if (image != null)
            {
                var data = new
                {
                    ImageId = image.ImageId,
                    Title = image.Title,
                    Comments = comments,
                    Url = image.Url
                };

                return Request.CreateResponse(HttpStatusCode.OK, data);
            }

            return Request.CreateResponse(HttpStatusCode.NotFound);
        }

        // POST api/Images
        // POST api/Images
        public async Task<HttpResponseMessage> PostImage(string title, int userId, int albumId)
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            //string debug = "2";
            string root = HttpContext.Current.Server.MapPath("~/App_Data");
            var provider = new MultipartFormDataStreamProvider(root);

            try
            {
                // Read the form data.
                await Request.Content.ReadAsMultipartAsync(provider);

                // This illustrates how to get the file names.
                foreach (MultipartFileData file in provider.FileData)
                {
                    Trace.WriteLine(file.Headers.ContentDisposition.FileName);
                    Trace.WriteLine("Server file path: " + file.LocalFileName);
                    string fileName = file.LocalFileName;
                    string hardcodedName = "test-image.jpg";

                    var url = DropBoxUploader.UploadProfilePicToDropBox(file.LocalFileName, file.Headers.ContentDisposition.FileName);

                    db.Images.Add(new Image
                    {
                        Title = title,
                        Url = url,
                        Album = db.Albums.FirstOrDefault(x => x.AlbumId == albumId)
                    });
                    db.SaveChanges();
                    break;
                }
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}