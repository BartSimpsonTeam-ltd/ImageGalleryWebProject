using Spring.IO;
using Spring.Social.Dropbox.Api;
using Spring.Social.Dropbox.Connect;
using Spring.Social.OAuth1;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace ImageGallery.Persisters
{
    public static class DropboxManager
    {
        private const string DropboxAppKey = "z2ecni1g60lr81u";
        private const string DropboxAppSecret = "9i2xmewprbcuxpe";
        private static string ApiDropboxAppKey = "";
        private static string ApiDropboxAppSecret = "";

        public static DropboxLink UploadFile(string filePath)
        {
            // checks if have tokens (hardcoded)
            DropboxServiceProvider dropboxServiceProvider =
                new DropboxServiceProvider(DropboxAppKey, DropboxAppSecret, AccessLevel.AppFolder);
            if (ApiDropboxAppKey.Length == 0)
            {
                AuthorizeAppOAuth(dropboxServiceProvider);
            }
            OAuthToken oauthAccessToken = new OAuthToken(ApiDropboxAppKey, ApiDropboxAppSecret);

            // Login in Dropbox
            IDropbox dropbox = dropboxServiceProvider.GetApi(oauthAccessToken.Value, oauthAccessToken.Secret);

            // Display user name (from his profile)
            DropboxProfile profile = dropbox.GetUserProfileAsync().Result;
            //Console.WriteLine("Hi " + profile.DisplayName + "!");

            // Upload a file
            string filename = "Image_" + DateTime.Now.Ticks + ".jpeg";
            Entry uploadFileEntry = dropbox.UploadFileAsync(
                new FileResource(filePath), filename).Result;

            // Share a file
            DropboxLink imageUrl = dropbox.GetMediaLinkAsync(uploadFileEntry.Path).Result;
            // DropboxLink sharedUrl = dropbox.GetShareableLinkAsync(uploadFileEntry.Path).Result;
            return imageUrl;
        }

        private static void AuthorizeAppOAuth(DropboxServiceProvider dropboxServiceProvider)
        {
            // Authorization without callback url
            OAuthToken oauthToken = dropboxServiceProvider.OAuthOperations.FetchRequestTokenAsync(null, null).Result;

            OAuth1Parameters parameters = new OAuth1Parameters();
            string authenticateUrl = dropboxServiceProvider.OAuthOperations.BuildAuthorizeUrl(
                oauthToken.Value, parameters);

            // Redirect the user for authorization 
            Process.Start(authenticateUrl);

            // Getting access token...
            AuthorizedRequestToken requestToken = new AuthorizedRequestToken(oauthToken, null);
            OAuthToken oauthAccessToken =
                dropboxServiceProvider.OAuthOperations.ExchangeForAccessTokenAsync(requestToken, null).Result;

            // set fields
            ApiDropboxAppKey = oauthAccessToken.Value;
            ApiDropboxAppSecret = oauthAccessToken.Secret;
        }
    }
}