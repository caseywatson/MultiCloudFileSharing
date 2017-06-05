var getConfiguration = function(context) {
    var configuration = {
        deploymentName: process.env["DeploymentName"],
        fileMetadataPartitionKey: process.env["FileMetadataPartitionKey"]
    };

    context.log.verbose("Configuration: [%j]", configuration);

    return configuration;
};

var validateFileMetadata = function(fileMetadata) {
    var validationErrors = [];
    
    if (fileMetadata) {
        if (!fileMetadata.fileId) {
            validationErrors.push("[fileMetadata.fileId] is required.");
        }

        if (!fileMetadata.fileName) {
            validationErrors.push("[fileMetadata.fileName] is required.");
        }

        if (!fileMetadata.fileType) {
            validationErrors.push("[fileMetadata.fileType] is required.");
        }
    } else {
        validationErrors.push("[fileMetadata] is required.");
    }

    return validationErrors;
};

var toTableEntity = function(fileMetadata, configuration) {
    return {
        PartitionKey: configuration.fileMetadataPartitionKey,
        RowKey: fileMetadata.fileId,
        FileName: fileMetadata.fileName,
        FileType: fileMetadata.fileType,
        FileDate: fileMetadata.fileDate,
        FileSource: fileMetadata.fileSource
    };
};

module.exports = function (context, req) {
    var fileMetadata = req.body.fileMetadata;
    var validationErrors = validateFileMetadata(fileMetadata);

    if (validationErrors.length) {
        context.log.warn(
            "File metadata [%j] validation failed: [%j].", 
            fileMetadata, validationErrors
        );

        context.res = {
            status: 400,
            body: validationErrors
        };
    } else {
        var configuration = getConfiguration(context);

        fileMetadata.fileDate = (fileMetadata.fileDate || new Date());
        fileMetadata.fileSource = (fileMetadata.fileSource || configuration.deploymentName);

        context.log.verbose("Saving file metadata [%j]...", fileMetadata);

        context.bindings.fileMetadataTable = toTableEntity(fileMetadata, configuration);
        context.bindings.fileMetadataAddedQueue = { fileMetadata };
    }

    context.done();
};