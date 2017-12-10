const azureStorage = require("azure-storage");

var getConfiguration = function(context) {
    var configuration = {
        fileContainerName: process.env["FileContainerName"],
        fileStorageConnectionString: process.env["StorageConnectionString"],
        fileUrlExpirationMinutes: process.env["FileUrlExpirationMinutes"]
    };

    context.log.verbose("Configuration: [%j]", configuration);

    return configuration;
};

var getTempFileUrl = function(context, fileId) {
    var configuration = getConfiguration(context);
    var blobService = azureStorage.createBlobService(configuration.fileStorageConnectionString);

    var sasStartDate = new Date();

    sasStartDate.setMinutes(sasStartDate.getMinutes() - 5);
    
    var sasExpirationDate = new Date(sasStartDate);

    sasExpirationDate.setMinutes(
        sasExpirationDate.getMinutes() + 
        configuration.fileUrlExpirationMinutes);

    var sasPolicy = {
        AccessPolicy: {
            Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
            Start: sasStartDate,
            Expiry: sasExpirationDate
        }
    };

    var sasToken = blobService.generateSharedAccessSignature(
        configuration.fileContainerName, fileId, sasPolicy);

    var tempFileUrl = blobService.getUrl(
        configuration.fileContainerName, fileId, sasToken, true);
    
    context.log.verbose("File [%s] temporary URL is [%s].", fileId, tempFileUrl);

    return tempFileUrl;
};

module.exports = function (context, req) {
    var fileId = context.bindingData.fileId;

    if (fileId) {
        context.done(null, {
            statusCode: 200,
            body: getTempFileUrl(context, fileId),
            headers: {
                "Content-Type": "text/plain"
            }
        });
    } else {
        context.log.warn("Bad request: [fileId] not provided.");

        context.done(null, {
            status: 400,
            body: "[fileId] is required."
        });
    }
};