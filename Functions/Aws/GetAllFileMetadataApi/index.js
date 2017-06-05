'use strict';

const dynamoDb = new require("dynamodb-doc").DynamoDB();
const util = require("util");

var getConfiguration = function() {
    var configuration = {
        fileMetadataTableName: process.env["FileMetadataTableName"]  
    };

    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

exports.handler = (event, context, callback) => {
    var configuration = getConfiguration();
    
    dynamoDb.scan({
        TableName: configuration.fileMetadataTableName
    }, function(error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                statusCode: "200",
                body: JSON.stringify(data.Items),
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
    });
};
