const request = require("request");
const util = require("util");

const replicationTargetName = "AwsEastUs";

var getConfiguration = function(context) {
    var configuration = {
        replicationEnabled: (process.env["FileReplicationEnabled_" + replicationTargetName].toLowerCase() === "true"),
        replicationUrl: process.env["FileReplicationUrl_" + replicationTargetName]
    };

    context.log.verbose("Configuration: [%j]", configuration);

    return configuration;
};

module.exports = function(context, replicationRequest) {
    var configuration = getConfiguration(context);

    if (configuration.replicationEnabled) {
        context.log.verbose(
            "Relaying replication request [%j] to [%s (%s)]...",
            replicationRequest, replicationTargetName, configuration.replicationUrl
        );

        request({
            url: configuration.replicationUrl,
            method: "POST",
            json: replicationRequest
        }, function(error, response, body) {
            if (error) {
                context.done(util.format(
                    "An error occurred while calling replication endpoint [%s (%s)]: [%s].",
                    replicationTargetName, configuration.replicationUrl, error
                ));
            } else {
                context.log.verbose(
                    "Successfully relayed replication request [%j] to [%s (%s)].",
                    replicationRequest, replicationTargetName, configuration.replicationUrl     
                );

                context.done();
            }
        });
    } else {
        context.log.warn(
            "Replication endpoint [%s (%s)] is currently disabled.",
            replicationTargetName, configuration.replicationUrl
        );

        context.done();
    }
};