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
    
    if (event.pathParameters && event.pathParameters.fileid) {
        var fileId = event.pathParameters.fileid;

        s3.getSignedUrl("getObject", {
           Bucket: configuration.fileBucketName,
           Key: fileId,
           Expires: (configuration.fileUrlExpirationMinutes * 60)
        }, function(error, url) {
           if (error) {
               callback(error);
           } else {
               console.log(util.format(
                   "File [%s] temporary URL is [%s].",
                   fileId, url));
               
               callback(null, {
                   body: url,
                   statusCode: "200",
                   headers: {
                       "Content-Type": "text/plain"
                   }
               });
           }
        });
    } else {
        callback(null, {
            statusCode: "400"
        });
    }
};
