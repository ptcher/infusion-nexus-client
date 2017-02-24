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

    var req = http.request(options, function () {
        promise.resolve(null);
    });

    req.write(JSON.stringify(body));
    req.end();

    return promise;
};

gpii.constructNexusPeer = function (host, port, componentPath, componentOptions) {
    return gpii.nexus.utils.sendRequestWithJsonBody(host, port, {
        method: "POST",
        path: "/components/" + componentPath
    }, componentOptions);
};

gpii.addNexusRecipe = function (host, port, recipeName, recipeContents) {
    return gpii.nexus.utils.sendRequestWithJsonBody(host, port, {
        method: "PUT",
        path: "/recipes/" + recipeName
    }, recipeContents);
};
