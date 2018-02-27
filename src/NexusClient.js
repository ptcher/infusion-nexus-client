/*
Copyright 2016-2018 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = fluid || require("infusion");

(function () {

    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.nexusClient.http");

    gpii.nexusClient.http.buildErrorObject = function (requestOptions, errorCode) {
        return {
            isError: true,
            message: fluid.stringTemplate("Error: %code %method %host:%port%path", {
                code: errorCode,
                method: requestOptions.method,
                host: requestOptions.host,
                port: requestOptions.port,
                path: requestOptions.path
            })
        };
    };

    fluid.defaults("gpii.nexusClient", {
        gradeNames: "fluid.component",
        nexusHost: "localhost",
        nexusPort: 9081,
        components: {
            http: {
                type: "gpii.nexusClient.http.nodejs"
            }
        },
        invokers: {
            writeDefaults: {
                funcName: "gpii.nexusClient.writeDefaults",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
                // gradeName, gradeDefaults
            },
            constructComponent: {
                funcName: "gpii.nexusClient.constructComponent",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
                // componentPath, componentOptions
            },
            destroyComponent: {
                funcName: "gpii.nexusClient.destroyComponent",
                args: ["{that}", "{arguments}.0"]
                // componentPath
            }
        }
    });

    gpii.nexusClient.writeDefaults = function (that, gradeName, gradeDefaults) {
        return that.http.request({
            method: "PUT",
            host: that.options.nexusHost,
            port: that.options.nexusPort,
            path: "/defaults/" + gradeName,
            contentType: "application/json",
            body: JSON.stringify(gradeDefaults)
        });
    };

    gpii.nexusClient.constructComponent = function (that, componentPath, componentOptions) {
        return that.http.request({
            method: "POST",
            host: that.options.nexusHost,
            port: that.options.nexusPort,
            path: "/components/" + componentPath,
            contentType: "application/json",
            body: JSON.stringify(componentOptions)
        });
    };

    gpii.nexusClient.destroyComponent = function (that, componentPath) {
        return that.http.request({
            method: "DELETE",
            host: that.options.nexusHost,
            port: that.options.nexusPort,
            path: "/components/" + componentPath
        });
    };

}());
