'use strict';

const aws = require("aws-sdk");
const s3Stream = require("s3-upload-stream")(new aws.S3());
const request = require("request");
const util = require("util");

var getConfiguration = function() {
    var configuration = {
        addFileMetadataUrl: process.env["AddFileMetadataUrl"],
        fileBucketName: process.env["FileBucketName"]
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

exports.handler = (event, context, callback) => {
    var configuration = getConfiguration();
    var replicationRequest = JSON.parse(event.Records[0].Sns.Message);
    var fileMetadata = replicationRequest.fileMetadata;
    
    console.log(util.format(
        "Processing replication request [%j]...",
        replicationRequest));
        
    var s3Upload = s3Stream.upload({
        Bucket: configuration.fileBucketName,
        Key: fileMetadata.fileId
    });
    
    s3Upload.on("error", function(error) {
        console.error(util.format(
            "An error occurred while uploading file [%s] to storage bucket [%s]: [%s].",
            fileMetadata.fileId, configuration.fileBucketName, error));
        
        callback(error);
    });
    
    s3Upload.on("uploaded", function(details) {
        console.log(util.format(
            "File [%s] successfully uploaded to storage bucket [%s].",
            fileMetadata.fileId, configuration.fileBucketName));
        
        request({
            url: configuration.addFileMetadataUrl,
            method: "POST",
            json: {
                fileMetadata
            },
        }, function(error, result, response) {
            if (error) {
                console.error(util.format(
                    "An error occurred while saving file metadata [%j]: [%s].",
                    fileMetadata, error));
                    
                callback(error);
            } else {
                console.log(util.format(
                    "File metadata [%j] successfully saved.",
                    fileMetadata));
                    
                callback();
            }
        });
    });
    
    console.log(util.format(
        "Streaming file [%s] to storage bucket [%s]...",
        replicationRequest.fileUrl, configuration.fileBucketName
    ));

    request(replicationRequest.fileUrl).pipe(s3Upload);
};
