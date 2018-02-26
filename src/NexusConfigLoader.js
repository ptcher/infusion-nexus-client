/*
Copyright 2018 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = fluid || require("infusion");

(function () {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.nexusConfigLoader", {
        gradeNames: "fluid.component",
        nexusHost: "localhost",
        nexusPort: 9081,
        components: {
            nexusClient: {
                type: "gpii.nexusClient",
                options: {
                    nexusHost: "{nexusConfigLoader}.options.nexusHost",
                    nexusPort: "{nexusConfigLoader}.options.nexusPort"
                }
            }
        },
        invokers: {
            loadConfig: {
                funcName: "gpii.nexusConfigLoader.loadConfig",
                args: ["{that}", "{arguments}.0"]
                // configuration
            }
        }
    });

    gpii.nexusConfigLoader.loadConfig = function (that, configuration) {
        var tasks = [];

        fluid.each(configuration.defaults, function (options, gradeName) {
            tasks.push(function () {
                return that.nexusClient.writeDefaults(gradeName, options);
            });
        });

        fluid.each(configuration.components, function (options, componentPath) {
            tasks.push(function () {
                return that.nexusClient.constructComponent(componentPath, options);
            });
        });

        return fluid.promise.sequence(tasks);
    };
}());
