'use strict';

const aws = require("aws-sdk");
const request = require("request");
const util = require("util");

const sns = new aws.SNS();

var getConfiguration = function() {
    var configuration = {
        deploymentName: process.env["DeploymentName"],
        getFileTempUrlFormat: process.env["GetFileTempUrlFormat"],
        replicationRequestTopicArn: process.env["ReplicationRequestOutboundTopicArn"]
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

exports.handler = (event, context, callback) => {
    var configuration = getConfiguration();
    var fileMetadata = JSON.parse(event.Records[0].Sns.Message);
    
    if (configuration.deploymentName == fileMetadata.fileSource) {
        var getTempFileUrl = util.format(configuration.getFileTempUrlFormat, fileMetadata.fileId);
        
        console.log(util.format(
            "Getting file [%s] temporary URL from [%s]...",
            fileMetadata.fileId, getTempFileUrl));
  
        request.get(getTempFileUrl, function(error, response, body) {
            if (error) {
                callback(error);
            } else {
                console.log(util.format(
                    "File [%s] temporary URL is [%s].",
                    fileMetadata.fileId, getTempFileUrl));

                var replicationRequest = {
                    fileMetadata,
                    fileUrl: body
                };

                console.log(util.format(
                    "Sending replication request [%j]...",
                    replicationRequest));

                sns.publish({
                    Message: JSON.stringify({
                        "default": JSON.stringify(replicationRequest)
                    }),
                    MessageStructure: "json",
                    TopicArn: configuration.replicationRequestTopicArn
                }, function(error, data) {
                    callback(error);
                });
            }   
        });
    } else {
        callback();
    }
};
