var validateReplicationRequest = function(replicationRequest) {
    var validationErrors = [];

    if (replicationRequest.fileMetadata) {
        var fileMetadata = replicationRequest.fileMetadata;

        if (!fileMetadata.fileId) {
            validationErrors.push("[fileMetadata.fileId] is required.");
        }

        if (!fileMetadata.fileName) {
            validationErrors.push("[fileMetadata.fileName] is required.");
        }

        if (!fileMetadata.fileType) {
            validationErrors.push("[fileMetadata.fileType] is required.");
        }

        if (!fileMetadata.fileDate) {
            validationErrors.push("[fileMetadata.fileDate] is required.");
        }

        if (!fileMetadata.fileSource) {
            validationErrors.push("[fileMetadata.fileSource] is required.");
        }
    } else {
        validationErrors.push("[fileMetadata] is required.");
    }

    if (!replicationRequest.fileUrl) {
        validationErrors.push("[fileUrl] is required.")
    }

    return validationErrors;
};

module.exports = function (context, req) {
    var replicationRequest = req.body;
    var validationErrors = validateReplicationRequest(replicationRequest);

    if (validationErrors.length) {
        context.log.warn(
            "File replication request [%j] validation failed: [%j].",
            replicationRequest, validationErrors
        );

        context.res = {
            status: 400,
            body: validationErrors
        };
    } else {
        context.log.verbose(
            "Forwarding replication request [%j]...",
            replicationRequest
        );

        context.bindings.replicateFileInboundQueue = replicationRequest;
    }

    context.done();
};