'use strict';

const aws = require("aws-sdk");
const util = require("util");

const s3 = new aws.S3();

var getConfiguration = function() {
    var configuration = {
        fileBucketName: process.env["FileBucketName"],
        fileUrlExpirationMinutes: process.env["FileUrlExpirationMinutes"]
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

exports.handler = (event, context, callback) => {
    var configuration = getConfiguration();
    
    if (event.fileId) {
        s3.getSignedUrl("getObject", {
           Bucket: configuration.fileBucketName,
           Key: event.fileId,
           Expires: (configuration.fileUrlExpirationMinutes * 60)
        }, function(error, url) {
           if (error) {
               callback(error);
           } else {
               console.log(util.format(
                   "File [%s] temporary URL is [%s].",
                   event.fileId, url));
               
               callback(null, url);
           }
        });
    } else {
        callback(null, "Bad Request 400: [fileId] is required.");
    }
};
