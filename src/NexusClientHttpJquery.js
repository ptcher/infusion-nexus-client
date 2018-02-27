/*
Copyright 2018 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

(function () {

    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.nexusClient.http.jquery", {
        gradeNames: "fluid.component",
        invokers: {
            request: {
                funcName: "gpii.nexusClient.http.jquery.request",
                args: ["{arguments}.0"] // options
            }
        }
    });

    gpii.nexusClient.http.jquery.request = function (options) {
        var promise = fluid.promise();

        // TODO: Don't ignore options.host and options.port

        var ajaxRequestOptions = {
            method: options.method,
            url: options.path,
            contentType: options.contentType,
            data: options.body,
            dataType: "text" // Tell jQuery not to process the response body;
            // needed because Nexus returns Content-Type "application/json"
            // with an empty response body and jQuery treats this as an error
        };

        $.ajax(ajaxRequestOptions)
            .done(function () {
                promise.resolve(null);
            })
            .fail(function (jqXHR) {
                promise.reject(gpii.nexusClient.http.buildErrorObject(options, jqXHR.status));
            });

        return promise;
    };

}());
