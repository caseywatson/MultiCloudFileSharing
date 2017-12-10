const request = require("request");
const util = require("util");

var getConfiguration = function(context) {
    var configuration = {
        deploymentName: process.env["DeploymentName"],
        getTempFileUrlFormat: process.env["GetTempFileUrlFormat"]
    };

    context.log.verbose("Configuration: [%j]", configuration);

    return configuration;
};

module.exports = function(context, fileMetadataAdded) {
    var configuration = getConfiguration(context);
    var fileMetadata = fileMetadataAdded.fileMetadata;

    if (configuration.deploymentName === fileMetadata.fileSource) {
        var getTempFileUrl = util.format(configuration.getTempFileUrlFormat, fileMetadata.fileId);

        context.log.verbose(
            "Getting file [%s] temporary URL from [%s]...",
            fileMetadata.fileId, getTempFileUrl 
        );

        request.get(getTempFileUrl, function(error, response, body) {
            if (error) {
                context.done(util.format(
                    "An error occurred while trying to get file [%s] temporary URL from [%s]: [%s].",
                    fileMetadata.fileId, getTempFileUrl, error
                ));
            } else {
                context.log.verbose(
                    "File [%s] temporary URL is [%s].",
                    fileMetadata.fileId, body
                );

                var replicationCommand = {
                    fileMetadata,
                    fileUrl: body
                };

                context.log.verbose(
                    "Sending replication command: [%j]...",
                    replicationCommand
                );

                context.bindings.replicateFileOutboundTopic = replicationCommand;
                context.done();
            }
        });
    }
};