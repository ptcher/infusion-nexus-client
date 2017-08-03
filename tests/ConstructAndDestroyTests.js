/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
// TODO: Is using NexusTestUtils.js reasonable?
fluid.require("%gpii-nexus/src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexusClient.constructAndDestroy");

gpii.tests.nexusClient.constructAndDestroy.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        name1: "hello NexusClientUtils"
    }
};

gpii.tests.nexusClient.constructAndDestroy.testDefs = [
    {
        name: "NexusClientUtils construct and destroy tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testComponentPath: "nexusClientUtilsConstructAndDestroyTestsComponentOne",
        sequence: [
            // Verify that the component doesn't already exist
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            // Construct and check that the constructed component model is as expected
            {
                task: "gpii.constructNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexusClient.constructAndDestroy.componentOptions
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Component construct promise resolved"]
            },
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexusClient.constructAndDestroy.componentOptions.model
                ]
            },
            // Destroy
            {
                task: "gpii.destroyNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath"
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Component destroy promise resolved"]
            },
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexusClient.constructAndDestroy.testDefs);
