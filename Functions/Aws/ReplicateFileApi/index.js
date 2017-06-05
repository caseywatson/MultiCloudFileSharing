'use strict';

const aws = require("aws-sdk");
const util = require("util");

const sns = new aws.SNS();

var getConfiguration = function() {
    var configuration = {
        replicationRequestTopicArn: process.env["ReplicationRequestInboundTopicArn"]  
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

var validateRequest = function(replicationRequest) {
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
        validationErrors.push("[fileUrl] is required.");
    }
    
    return validationErrors;
};

exports.handler = (event, context, callback) => {
    var request = JSON.parse(event.body);
    var validationErrors = validateRequest(request);
    
    if (validationErrors.length) {
        console.warn(util.format(
            "File replication request [%j] validation failed: [%j]",
            request, validationErrors));
        
        callback(null, {
           statusCode: 400,
           body: JSON.stringify(validationErrors),
           headers: {
               "Content-Type": "application/json"
           }
        });
    } else {
        var configuration = getConfiguration();
        
        console.log(util.format(
            "Relaying replication request [%j]...",
            request));
        
        sns.publish({
            Message: JSON.stringify({
                "default": JSON.stringify(request)
            }),
            MessageStructure: "json",
            TopicArn: configuration.replicationRequestTopicArn
        }, function(error, data) {
            if (error) {
                callback(error);
            } else {
                callback(null, {
                    statusCode: 200
                });
            }
        });
    }
};
