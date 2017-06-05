using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MultiCloudFileSharing.Web.Interfaces;
using MultiCloudFileSharing.Web.Models;
using MultiCloudFileSharing.Web.Options;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;

namespace MultiCloudFileSharing.Web.Services
{
    public class FileMetadataServiceProxy : IFileMetadataServiceProxy
    {
        private const string JsonMediaType = "application/json";
        private static readonly HttpClient httpClient;
        private readonly FileMetadataServiceOptions options;

        static FileMetadataServiceProxy()
        {
            httpClient = new HttpClient();

            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(JsonMediaType));
        }

        public FileMetadataServiceProxy(IOptionsSnapshot<FileMetadataServiceOptions> options)
        {
            this.options = options.Value;
        }

        public async Task AddFileMetadataAsync(FileMetadata fileMetadata)
        {
            if (fileMetadata == null)
                throw new ArgumentNullException(nameof(fileMetadata));

            var fileMetadataJson = JsonConvert.SerializeObject(new { fileMetadata });

            var httpResponse = await httpClient.PostAsync(
                options.PostFileMetadataUrl,
                new StringContent(fileMetadataJson, Encoding.UTF8, JsonMediaType));

            if (httpResponse.IsSuccessStatusCode == false)
            {
                var responseText = await httpResponse.Content.ReadAsStringAsync();

                throw new Exception($"Unable to post file metadata: [{httpResponse.StatusCode}]: [{responseText}].");
            }
        }

        public async Task<IEnumerable<FileMetadata>> GetAllFileMetadataAsync()
        {
            var httpResponse = await httpClient.GetAsync(options.GetAllFileMetadataUrl);

            if (httpResponse.IsSuccessStatusCode)
            {
                var fileMetadataJson = await httpResponse.Content.ReadAsStringAsync();

                return JsonConvert.DeserializeObject<IEnumerable<FileMetadata>>(fileMetadataJson);
            }
            else
            {
                throw new Exception($"Unable to get file metadata: [{httpResponse.StatusCode}]: [{httpResponse.ReasonPhrase}].");
            }
        }
    }
}
