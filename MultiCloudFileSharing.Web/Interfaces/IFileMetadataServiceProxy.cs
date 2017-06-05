using MultiCloudFileSharing.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MultiCloudFileSharing.Web.Interfaces
{
    public interface IFileMetadataServiceProxy
    {
        Task AddFileMetadataAsync(FileMetadata fileMetadata);
        Task<IEnumerable<FileMetadata>> GetAllFileMetadataAsync();
    }
}
