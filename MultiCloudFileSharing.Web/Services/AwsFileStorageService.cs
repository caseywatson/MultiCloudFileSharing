using MultiCloudFileSharing.Web.Interfaces;
using System;
using System.Threading.Tasks;
using System.IO;
using MultiCloudFileSharing.Web.Options;
using Microsoft.Extensions.Options;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;

namespace MultiCloudFileSharing.Web.Services
{
    public class AwsFileStorageService : IFileStorageService
    {
        private readonly AwsFileStorageOptions options;
        private readonly RegionEndpoint regionEndpoint;

        public AwsFileStorageService(IOptionsSnapshot<AwsFileStorageOptions> options)
        {
            this.options = options.Value;

            regionEndpoint = RegionEndpoint.GetBySystemName(this.options.RegionName);
        }

        public async Task<Stream> DownloadFileAsync(string fileId)
        {
            if (string.IsNullOrEmpty(fileId))
                throw new ArgumentException($"[{nameof(fileId)} is required.", nameof(fileId));

            using (var s3Client = new AmazonS3Client(options.AwsAccessKeyId, options.AwsSecretAccessKey, regionEndpoint))
            {
                var outputStream = new MemoryStream();
                var getObjectResponse = await s3Client.GetObjectAsync(options.FileBucketName, fileId);

                getObjectResponse.ResponseStream.CopyTo(outputStream);
                outputStream.Position = 0;

                return outputStream;
            }
        }

        public async Task UploadFileAsync(string fileId, Stream fileStream)
        {
            if (string.IsNullOrEmpty(fileId))
                throw new ArgumentException($"[{nameof(fileId)}] is required.", nameof(fileId));

            if (fileStream == null)
                throw new ArgumentNullException(nameof(fileStream));

            using (var s3Client = new AmazonS3Client(options.AwsAccessKeyId, options.AwsSecretAccessKey, regionEndpoint))
            {
                if (fileStream.CanSeek)
                    fileStream.Position = 0;

                var putObjectRequest = new PutObjectRequest
                {
                    BucketName = options.FileBucketName,
                    InputStream = fileStream,
                    Key = fileId
                };

                await s3Client.PutObjectAsync(putObjectRequest);
            }
        }
    }
}
