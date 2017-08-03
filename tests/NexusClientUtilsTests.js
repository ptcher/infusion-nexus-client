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

fluid.registerNamespace("gpii.tests.nexusClientUtils.writeNexusDefaults");
fluid.registerNamespace("gpii.tests.nexusClientUtils.constructAndDestroy");

gpii.tests.nexusClientUtils.newGradeOptions = {
    gradeNames: ["fluid.component"],
    name1: "hello NexusClientUtils"
};

gpii.tests.nexusClientUtils.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        name1: "hello NexusClientUtils"
    }
};

gpii.tests.nexusClientUtils.writeNexusDefaults.testDefs = [
    {
        name: "NexusClientUtils writeNexusDefaults tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexusClientUtils.newGrade",
        sequence: [
            {
                task: "gpii.writeNexusDefaults",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testGradeName",
                    gpii.tests.nexusClientUtils.newGradeOptions
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Write defaults promise resolved"]
            },
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsRequest}",
                    {
                        gradeNames: ["fluid.component", "gpii.tests.nexusClientUtils.newGrade"],
                        name1: "hello NexusClientUtils"
                    }
                ]
            }
        ]
    }
];

gpii.tests.nexusClientUtils.constructAndDestroy.testDefs = [
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
                    gpii.tests.nexusClientUtils.componentOptions
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
                    gpii.tests.nexusClientUtils.componentOptions.model
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

// Without Nexus running

fluid.defaults("gpii.tests.nexusClientUtils.noNexusTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    serverHost: "localhost",
    serverPort: 8082,
    components: {
        recipeProductTester: {
            type: "gpii.tests.nexusClientUtils.noNexusTester"
        }
    }
});

fluid.defaults("gpii.tests.nexusClientUtils.noNexusTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "NexusClientUtils No Nexus tests",
        tests: [
            {
                name: "writeNexusDefaults",
                expect: 1,
                sequence: [
                    {
                        task: "gpii.writeNexusDefaults",
                        args: [
                            "{testEnvironment}.options.serverHost",
                            "{testEnvironment}.options.serverPort",
                            "someGradeName",
                            gpii.tests.nexusClientUtils.newGradeOptions
                        ],
                        reject: "jqUnit.assert",
                        rejectArgs: ["Write defaults promise rejected"]
                    }
                ]
            },
            {
                name: "constructNexusPeer",
                expect: 1,
                sequence: [
                    {
                        task: "gpii.constructNexusPeer",
                        args: [
                            "{testEnvironment}.options.serverHost",
                            "{testEnvironment}.options.serverPort",
                            "someComponentPath",
                            gpii.tests.nexusClientUtils.componentOptions
                        ],
                        reject: "jqUnit.assert",
                        rejectArgs: ["Construct component promise rejected"]
                    }
                ]
            },
            {
                name: "destroyNexusPeer",
                expect: 1,
                sequence: [
                    {
                        task: "gpii.destroyNexusPeer",
                        args: [
                            "{testEnvironment}.options.serverHost",
                            "{testEnvironment}.options.serverPort",
                            "someComponentPath"
                        ],
                        reject: "jqUnit.assert",
                        rejectArgs: ["Destroy component promise rejected"]
                    }
                ]
            }
        ]
    }]
});

kettle.test.bootstrapServer(gpii.tests.nexusClientUtils.writeNexusDefaults.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClientUtils.constructAndDestroy.testDefs);
fluid.test.runTests(["gpii.tests.nexusClientUtils.noNexusTestTree"]);
