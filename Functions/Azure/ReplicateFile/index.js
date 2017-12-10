const azureStorage = require("azure-storage");
const request = require("request");
const util = require("util");

var getConfiguration = function(context) {
    var configuration = {
        addFileMetadataUrl: process.env["AddFileMetadataUrl"],
        fileContainerName: process.env["FileContainerName"],
        fileStorageConnectionString: process.env["StorageConnectionString"]
    };

    context.log.verbose("Configuration: [%j]", configuration);
    
    return configuration;
};

module.exports = function(context, replicationRequest) {
    context.log.verbose(
        "Processing replication request [%j]...",
        replicationRequest
    );

    var fileMetadata = replicationRequest.fileMetadata;
    var fileUrl = replicationRequest.fileUrl;

    var configuration = getConfiguration(context);
    var blobService = azureStorage.createBlobService(configuration.fileStorageConnectionString);

    function saveFileMetadataCallback(error, result, response) {
        if (error) {
            context.done(util.format(
                "An error occurred while saving file [%j] metadata: [%s].",
                fileMetadata, error
            ));
        } else {
            context.log.verbose(
                "File metadata [%j] successfully saved.",
                fileMetadata
            );

            context.done();
        }
    }

    function saveFileMetadata() {
        request({
            url: configuration.addFileMetadataUrl,
            method: "POST",
            json: { fileMetadata: replicationRequest.fileMetadata },
        }, saveFileMetadataCallback);
    }

    function uploadFileCallback(error, result, response) {
        if (error) {
            context.done(util.format(
                "An error occurred while uploading file [%s] to storage container [%s]: [%s].",
                fileMetadata.fileId, configuration.fileContainerName, error
            ));
        } else {
            context.log.verbose(
                "File [%s] successfully uploaded to storage container [%s].",
                fileMetadata.fileId, configuration.fileContainerName
            );

            context.log.verbose(
                "Saving file metadata [%j]...",
                fileMetadata
            );

            saveFileMetadata();
        }
    }

    var blobStream = blobService.createWriteStreamToBlockBlob(
        configuration.fileContainerName,
        fileMetadata.fileId,
        {
            contentSettings: {
                contentType: fileMetadata.fileType
            }
        },
        uploadFileCallback
    );

    context.log.verbose(
        "Streaming file [%s] to storage container [%s]...",
        replicationRequest.fileUrl, configuration.fileContainerName
    );

    request(replicationRequest.fileUrl).pipe(blobStream);
};