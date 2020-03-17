/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

require("../index.js");
// TODO: Is using NexusTestUtils.js reasonable?
fluid.require("%infusion-nexus/src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.nexusClientUtils.writeNexusDefaults");
fluid.registerNamespace("fluid.tests.nexusClientUtils.constructAndDestroy");

fluid.tests.nexusClientUtils.newGradeOptions = {
    gradeNames: ["fluid.component"],
    name1: "hello NexusClientUtils"
};

fluid.tests.nexusClientUtils.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        name1: "hello NexusClientUtils"
    }
};

fluid.tests.nexusClientUtils.writeNexusDefaults.testDefs = [
    {
        name: "NexusClientUtils writeNexusDefaults tests",
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testGradeName: "fluid.tests.nexusClientUtils.newGrade",
        sequence: [
            {
                task: "fluid.writeNexusDefaults",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testGradeName",
                    fluid.tests.nexusClientUtils.newGradeOptions
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Write defaults promise resolved"]
            },
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "fluid.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsRequest}",
                    {
                        gradeNames: ["fluid.component", "fluid.tests.nexusClientUtils.newGrade"],
                        name1: "hello NexusClientUtils"
                    }
                ]
            }
        ]
    }
];

fluid.tests.nexusClientUtils.constructAndDestroy.testDefs = [
    {
        name: "NexusClientUtils construct and destroy tests",
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 6,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testComponentPath: "nexusClientUtilsConstructAndDestroyTestsComponentOne",
        sequence: [
            // Verify that the component doesn't already exist
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            // Construct and check that the constructed component model is as expected
            {
                task: "fluid.constructNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath",
                    fluid.tests.nexusClientUtils.componentOptions
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Component construct promise resolved"]
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    fluid.tests.nexusClientUtils.componentOptions.model
                ]
            },
            // Destroy
            {
                task: "fluid.destroyNexusPeer",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testComponentPath"
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Component destroy promise resolved"]
            },
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            }
        ]
    }
];

// Test error cases with no Nexus running

fluid.defaults("fluid.tests.nexusClientUtils.noNexusTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    serverHost: "localhost",
    serverPort: 8082,
    components: {
        noNexusTester: {
            type: "fluid.tests.nexusClientUtils.noNexusTester"
        }
    }
});

fluid.defaults("fluid.tests.nexusClientUtils.noNexusTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "NexusClientUtils No Nexus tests",
        tests: [
            {
                name: "writeNexusDefaults",
                expect: 1,
                sequence: [
                    {
                        task: "fluid.writeNexusDefaults",
                        args: [
                            "{testEnvironment}.options.serverHost",
                            "{testEnvironment}.options.serverPort",
                            "someGradeName",
                            fluid.tests.nexusClientUtils.newGradeOptions
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
                        task: "fluid.constructNexusPeer",
                        args: [
                            "{testEnvironment}.options.serverHost",
                            "{testEnvironment}.options.serverPort",
                            "someComponentPath",
                            fluid.tests.nexusClientUtils.componentOptions
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
                        task: "fluid.destroyNexusPeer",
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

kettle.test.bootstrapServer(fluid.tests.nexusClientUtils.writeNexusDefaults.testDefs);
kettle.test.bootstrapServer(fluid.tests.nexusClientUtils.constructAndDestroy.testDefs);
fluid.test.runTests(["fluid.tests.nexusClientUtils.noNexusTestTree"]);
