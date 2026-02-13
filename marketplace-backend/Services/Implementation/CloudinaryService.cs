using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using MarketPlace.Configuration;
using MarketPlace.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace MarketPlace.Services.Implementation
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string?> UploadImageAsync(IFormFile file, string folder = "products")
        {
            if (file == null || file.Length == 0)
                return null;

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return null;

            if (file.Length > 5 * 1024 * 1024)
                return null;

            try
            {
                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = $"marketplace/{folder}",
                    Transformation = new Transformation()
                        .Width(800)
                        .Height(800)
                        .Crop("limit")
                        .Quality("auto:good")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    return uploadResult.SecureUrl.ToString();
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return false;

            try
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);
                return result.Result == "ok";
            }
            catch
            {
                return false;
            }
        }

        public string? GetPublicIdFromUrl(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return null;

            try
            {
                var uri = new Uri(imageUrl);
                var pathSegments = uri.AbsolutePath.Split('/');

                var uploadIndex = Array.IndexOf(pathSegments, "upload");
                if (uploadIndex >= 0 && uploadIndex + 2 < pathSegments.Length)
                {
                    var relevantParts = pathSegments.Skip(uploadIndex + 2).ToArray();
                    var fullPath = string.Join("/", relevantParts);

                    var lastDotIndex = fullPath.LastIndexOf('.');
                    if (lastDotIndex > 0)
                    {
                        return fullPath.Substring(0, lastDotIndex);
                    }
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}