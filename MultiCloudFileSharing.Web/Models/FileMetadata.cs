using Newtonsoft.Json;
using System;

namespace MultiCloudFileSharing.Web.Models
{
    public class FileMetadata
    {
        [JsonProperty(PropertyName = "fileId")]
        public string FileId { get; set; }

        [JsonProperty(PropertyName = "fileName")]
        public string FileName { get; set; }

        [JsonProperty(PropertyName = "fileType")]
        public string FileType { get; set; }

        [JsonProperty(PropertyName = "fileDate")]
        public DateTime FileDate { get; set; }

        [JsonProperty(PropertyName = "fileSource")]
        public string FileSource { get; set; }
    }
}
