using Microsoft.AspNetCore.Http;
using MultiCloudFileSharing.Web.Models;
using System;

namespace MultiCloudFileSharing.Web.Extensions
{
    public static class FormFileExtensions
    {
        public static FileMetadata CreateFileMetadata(this IFormFile formFile)
        {
            if (formFile == null)
                throw new ArgumentNullException(nameof(formFile));

            return new FileMetadata
            {
                FileId = Guid.NewGuid().ToString(),
                FileName = formFile.FileName,
                FileType = formFile.ContentType,
                FileDate = DateTime.UtcNow
            };
        }
    }
}
