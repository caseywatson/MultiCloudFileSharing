using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MultiCloudFileSharing.Web.Interfaces;
using Microsoft.AspNetCore.Http;
using MultiCloudFileSharing.Web.Models;
using MultiCloudFileSharing.Web.Extensions;
using System.IO;
using MultiCloudFileSharing.Web.ViewModels;
using Microsoft.Extensions.Options;
using MultiCloudFileSharing.Web.Options;

namespace MultiCloudFileSharing.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly DeploymentOptions deploymentOptions;
        private readonly IFileMetadataServiceProxy fileMetadataService;
        private readonly IFileStorageService fileStorageService;

        public HomeController(IOptions<DeploymentOptions> deploymentOptions, IFileMetadataServiceProxy fileMetadataService, IFileStorageService fileStorageService)
        {
            this.deploymentOptions = deploymentOptions.Value;
            this.fileMetadataService = fileMetadataService;
            this.fileStorageService = fileStorageService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFiles(List<IFormFile> files)
        {
            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var fileMetadata = formFile.CreateFileMetadata();
                    var fileStream = new MemoryStream();

                    await formFile.CopyToAsync(fileStream);
                    await fileStorageService.UploadFileAsync(fileMetadata.FileId, fileStream);
                    await fileMetadataService.AddFileMetadataAsync(fileMetadata);
                }
            }

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> DownloadFile(string fileId, string fileContentType, string fileDownloadName)
        {
            if (string.IsNullOrEmpty(fileId))
                return BadRequest($"[{nameof(fileId)}] is required.");

            if (string.IsNullOrEmpty(fileContentType))
                return BadRequest($"[{nameof(fileContentType)}] is required.");

            if (string.IsNullOrEmpty(fileDownloadName))
                return BadRequest($"[{nameof(fileDownloadName)}] is required.");

            var fileStream = await fileStorageService.DownloadFileAsync(fileId);

            return File(fileStream, fileContentType, fileDownloadName);
        }

        public async Task<IActionResult> Index()
        {
            ViewData["DeploymentName"] = deploymentOptions.Name;

            var allFileMetadata = await fileMetadataService.GetAllFileMetadataAsync();
            var fileMetadataViewModels = allFileMetadata.Select(ToFileMetadataViewModel).ToList();

            return View(fileMetadataViewModels);
        }

        public IActionResult Error()
        {
            return View();
        }

        private FileMetadataViewModel ToFileMetadataViewModel(FileMetadata fileMetadata)
        {
            return new FileMetadataViewModel
            {
                FileId = fileMetadata.FileId,
                FileName = fileMetadata.FileName,
                FileType = fileMetadata.FileType,
                FileDate = fileMetadata.FileDate.ToString(),
                FileSource = fileMetadata.FileSource,
                FileDownloadLink = Url.Action(nameof(DownloadFile),
                new
                {
                    fileId = fileMetadata.FileId,
                    fileContentType = fileMetadata.FileType,
                    fileDownloadName = fileMetadata.FileName
                })
            };
        }
    }
}
