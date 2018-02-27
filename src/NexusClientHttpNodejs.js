/*
Copyright 2016-2018 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var http = require("http");

var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.nexusClient.http.nodejs", {
    gradeNames: "fluid.component",
    invokers: {
        request: {
            funcName: "gpii.nexusClient.http.nodejs.request",
            args: ["{arguments}.0"] // options
        }
    }
});

gpii.nexusClient.http.nodejs.request = function (options) {
    var promise = fluid.promise();

    var nodejsRequestOptions = {
        method: options.method,
        host: options.host,
        port: options.port,
        path: options.path
    };

    if (options.contentType) {
        nodejsRequestOptions.headers = {
            "Content-Type": options.contentType
        };
    }

    var req = http.request(nodejsRequestOptions);

    req.on("response", function () {
        promise.resolve(null);
    });

    req.on("error", function (error) {
        promise.reject(gpii.nexusClient.http.buildErrorObject(options, error.code));
    });

    if (options.body) {
        req.write(options.body);
    }

    req.end();

    return promise;
};
