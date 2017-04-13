"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var http = require("http");

fluid.registerNamespace("gpii.nexus.utils");

gpii.nexus.utils.sendRequestWithJsonBody = function (host, port, options, body) {
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
        promise.reject({
            isError: true,
            message: fluid.stringTemplate("Error: %code %method %host:%port%path", {
                code: error.code,
                method: options.method,
                host: host,
                port: port,
                path: options.path
            })
        });
    });

    req.write(JSON.stringify(body));
    req.end();

    return promise;
};

gpii.writeNexusDefaults = function (host, port, gradeName, gradeDefaults) {
    return gpii.nexus.utils.sendRequestWithJsonBody(host, port, {
        method: "PUT",
        path: "/defaults/" + gradeName
    }, gradeDefaults);
};

gpii.constructNexusPeer = function (host, port, componentPath, componentOptions) {
    return gpii.nexus.utils.sendRequestWithJsonBody(host, port, {
        method: "POST",
        path: "/components/" + componentPath
    }, componentOptions);
};

gpii.destroyNexusPeer = function (host, port, componentPath) {
    var options = {
        host: host,
        port: port,
        method: "DELETE",
        path: "/components/" + componentPath
    };

    var promise = fluid.promise();

    var req = http.request(options, function () {
        promise.resolve(null);
    });

    req.end();

    return promise;
};

gpii.addNexusRecipe = function (host, port, recipeName, recipeContents) {
    return gpii.nexus.utils.sendRequestWithJsonBody(host, port, {
        method: "PUT",
        path: "/recipes/" + recipeName
    }, recipeContents);
};
