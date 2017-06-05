const request = require("request");
const util = require("util");

var getConfiguration = function() {
    var configuration = {
        replicationTargetName: process.env["ReplicationTargetName"],
        replicationEnabled: (process.env["ReplicationEnabled"] === "true"),
        replicationUrl: (process.env["ReplicationUrl"])
    };
    
    console.log(util.format("Configuration: [%j]", configuration));
    
    return configuration;
};

exports.handler = (event, context, callback) => {
    var configuration = getConfiguration();
    var replicationRequest = JSON.parse(event.Records[0].Sns.Message);
    
    console.log(util.format(
        "Replication request received: [%j].",
        replicationRequest));
    
    if (configuration.replicationEnabled) {
        console.log(util.format(
            "Relaying replication request [%j] to [%s (%s)]...",
            replicationRequest, configuration.replicationTargetName, 
            configuration.replicationUrl));
        
        request({
            url: configuration.replicationUrl,
            method: "POST",
            json: replicationRequest
        }, function(error, response, body) {
            if (error) {
                callback(error);
            } else {
                console.log(util.format(
                    "Successfully relayed replication request [%j] to [%s (%s)].",
                    replicationRequest, configuration.replicationTargetName, 
                    configuration.replicationUrl));

                callback();
            }
        });
        
    } else {
        console.warn(util.format(
            "Replication endpoint [%s (%s)] is currently disabled.",
            configuration.replicationTargetName, configuration.replicationUrl));
            
        callback();
    }
};