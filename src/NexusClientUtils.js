/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var http = require("http");

fluid.registerNamespace("fluid.nexusClientUtils");

fluid.nexusClientUtils.sendRequestWithJsonBody = function (host, port, options, body) {
    options = fluid.extend({
        host: host,
        port: port,
        headers: {
            "Content-Type": "application/json"
        }
    }, options);

    var promise = fluid.promise();

    var req = http.request(options);

    req.on("response", function () {
        promise.resolve(null);
    });

    req.on("error", function (error) {
        promise.reject(fluid.nexusClientUtils.buildErrorObject(options, error));
    });

    req.write(JSON.stringify(body));
    req.end();

    return promise;
};

fluid.nexusClientUtils.buildErrorObject = function (requestOptions, error) {
    return {
        isError: true,
        message: fluid.stringTemplate("Error: %code %method %host:%port%path", {
            code: error.code,
            method: requestOptions.method,
            host: requestOptions.host,
            port: requestOptions.port,
            path: requestOptions.path
        })
    };
};

fluid.writeNexusDefaults = function (host, port, gradeName, gradeDefaults) {
    return fluid.nexusClientUtils.sendRequestWithJsonBody(host, port, {
        method: "PUT",
        path: "/defaults/" + gradeName
    }, gradeDefaults);
};

fluid.constructNexusPeer = function (host, port, componentPath, componentOptions) {
    return fluid.nexusClientUtils.sendRequestWithJsonBody(host, port, {
        method: "POST",
        path: "/components/" + componentPath
    }, componentOptions);
};

fluid.destroyNexusPeer = function (host, port, componentPath) {
    var options = {
        host: host,
        port: port,
        method: "DELETE",
        path: "/components/" + componentPath
    };

    var promise = fluid.promise();

    var req = http.request(options);

    req.on("response", function () {
        promise.resolve(null);
    });

    req.on("error", function (error) {
        promise.reject(fluid.nexusClientUtils.buildErrorObject(options, error));
    });

    req.end();

    return promise;
};
