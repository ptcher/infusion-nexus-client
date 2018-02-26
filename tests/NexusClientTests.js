/*
Copyright 2017, 2018 OCAD University

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

fluid.registerNamespace("gpii.tests.nexusClient.writeDefaults");
fluid.registerNamespace("gpii.tests.nexusClient.constructAndDestroy");

gpii.tests.nexusClient.newGradeOptions = {
    gradeNames: ["fluid.component"],
    name1: "hello nexusClient"
};

gpii.tests.nexusClient.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        name1: "hello nexusClient"
    }
};

gpii.tests.nexusClient.writeDefaults.testDefs = [
    {
        name: "nexusClient writeDefaults tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexusClient.newGrade",
        components: {
            nexusClient: {
                type: "gpii.nexusClient",
                options: {
                    nexusHost: "localhost",
                    nexusPort: "{configuration}.options.serverPort"
                }
            }
        },
        sequence: [
            {
                task: "{nexusClient}.writeDefaults",
                args: [
                    "{tests}.options.testGradeName",
                    gpii.tests.nexusClient.newGradeOptions
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
                        gradeNames: ["fluid.component", "gpii.tests.nexusClient.newGrade"],
                        name1: "hello nexusClient"
                    }
                ]
            }
        ]
    }
];

gpii.tests.nexusClient.constructAndDestroy.testDefs = [
    {
        name: "nexusClient construct and destroy tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testComponentPath: "nexusClientConstructAndDestroyTestsComponentOne",
        components: {
            nexusClient: {
                type: "gpii.nexusClient",
                options: {
                    nexusHost: "localhost",
                    nexusPort: "{configuration}.options.serverPort"
                }
            }
        },
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
                task: "{nexusClient}.constructComponent",
                args: [
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexusClient.componentOptions
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
                    gpii.tests.nexusClient.componentOptions.model
                ]
            },
            // Destroy
            {
                task: "{nexusClient}.destroyComponent",
                args: [
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

// Test error cases with no Nexus running

fluid.defaults("gpii.tests.nexusClient.noNexusTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    serverHost: "localhost",
    serverPort: 8082,
    components: {
        noNexusTester: {
            type: "gpii.tests.nexusClient.noNexusTester"
        }
    }
});

fluid.defaults("gpii.tests.nexusClient.noNexusTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    components: {
        nexusClient: {
            type: "gpii.nexusClient",
            options: {
                nexusHost: "{testEnvironment}.options.serverHost",
                nexusPort: "{testEnvironment}.options.serverPort"
            }
        }
    },
    modules: [{
        name: "nexusClient No Nexus tests",
        tests: [
            {
                name: "writeDefaults",
                expect: 1,
                sequence: [
                    {
                        task: "{nexusClient}.writeDefaults",
                        args: [
                            "someGradeName",
                            gpii.tests.nexusClient.newGradeOptions
                        ],
                        reject: "jqUnit.assert",
                        rejectArgs: ["Write defaults promise rejected"]
                    }
                ]
            },
            {
                name: "constructComponent",
                expect: 1,
                sequence: [
                    {
                        task: "{nexusClient}.constructComponent",
                        args: [
                            "someComponentPath",
                            gpii.tests.nexusClient.componentOptions
                        ],
                        reject: "jqUnit.assert",
                        rejectArgs: ["Construct component promise rejected"]
                    }
                ]
            },
            {
                name: "destroyComponent",
                expect: 1,
                sequence: [
                    {
                        task: "{nexusClient}.destroyComponent",
                        args: [
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

kettle.test.bootstrapServer(gpii.tests.nexusClient.writeDefaults.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClient.constructAndDestroy.testDefs);
fluid.test.runTests(["gpii.tests.nexusClient.noNexusTestTree"]);
