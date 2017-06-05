using MultiCloudFileSharing.Web.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using MultiCloudFileSharing.Web.Options;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;

namespace MultiCloudFileSharing.Web.Services
{
    public class AzureFileStorageService : IFileStorageService
    {
        private readonly AzureFileStorageOptions options;

        public AzureFileStorageService(IOptionsSnapshot<AzureFileStorageOptions> options)
        {
            this.options = options.Value;
        }

        public async Task<Stream> DownloadFileAsync(string fileId)
        {
            if (string.IsNullOrEmpty(fileId))
                throw new ArgumentException($"[{nameof(fileId)}] is required.", nameof(fileId));

            var storageAccount = CloudStorageAccount.Parse(options.StorageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(options.FileContainerName);
            var blob = container.GetBlockBlobReference(fileId);
            var outputStream = new MemoryStream();

            await blob.DownloadToStreamAsync(outputStream);

            outputStream.Position = 0;

            return outputStream;
        }

        public async Task UploadFileAsync(string fileId, Stream fileStream)
        {
            if (string.IsNullOrEmpty(fileId))
                throw new ArgumentException($"[{nameof(fileId)}] is required.", nameof(fileId));

            var storageAccount = CloudStorageAccount.Parse(options.StorageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(options.FileContainerName);

            await container.CreateIfNotExistsAsync();

            var blob = container.GetBlockBlobReference(fileId);

            if (fileStream.CanSeek)
                fileStream.Position = 0;

            await blob.UploadFromStreamAsync(fileStream);
        }
    }
}
