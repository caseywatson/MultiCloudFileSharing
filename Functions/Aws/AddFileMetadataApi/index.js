'use strict';

const aws = require("aws-sdk");
const dynamoDbDoc = require("dynamodb-doc");
const util = require("util");

const dynamoDb = new dynamoDbDoc.DynamoDB();
const sns = new aws.SNS();
 
var getConfiguration = function() {
    var configuration = {
        deploymentName: process.env["DeploymentName"],
        fileMetadataAddedTopicArn: process.env["FileMetadataAddedTopicArn"],
        fileMetadataTableName: process.env["FileMetadataTableName"]
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
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
 
exports.handler = (event, context, callback) => {
    var fileMetadata = JSON.parse(event.body).fileMetadata;
    var validationErrors = validateFileMetadata(fileMetadata);
    
    if (validationErrors.length) {
        console.warn(util.format(
            "File metadata [%j] validation failed: [%j]",
            fileMetadata, validationErrors));
        
        callback(null, {
           statusCode: 200,
           body: JSON.stringify(validationErrors),
           headers: {
               "Content-Type": "application/json"
           }
        });
    } else {
        var configuration = getConfiguration();
        
        fileMetadata.fileDate = (fileMetadata.fileDate || new Date().toString());
        fileMetadata.fileSource = (fileMetadata.fileSource || configuration.deploymentName);
        
        console.log(util.format("Saving file metadata [%j]...", fileMetadata));
        
        dynamoDb.putItem({
           TableName: configuration.fileMetadataTableName,
           Item: fileMetadata
        },
        function (error, response) {
           if (error) {
               callback(error);
           } else {
               sns.publish({
                  Message: JSON.stringify({ 
                      "default": JSON.stringify(fileMetadata)
                      }),
                  MessageStructure: "json",
                  TopicArn: configuration.fileMetadataAddedTopicArn
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
        });
    }
};
