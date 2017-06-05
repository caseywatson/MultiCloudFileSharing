using System.IO;
using System.Threading.Tasks;

namespace MultiCloudFileSharing.Web.Interfaces
{
    public interface IFileStorageService
    {
        Task<Stream> DownloadFileAsync(string fileId);
        Task UploadFileAsync(string fileId, Stream fileStream);
    }
}
