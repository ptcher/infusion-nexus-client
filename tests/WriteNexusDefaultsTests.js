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

fluid.registerNamespace("gpii.tests.nexusClient.writeNexusDefaults");

gpii.tests.nexusClient.writeNexusDefaults.newGradeOptions = {
    gradeNames: ["fluid.component"],
    name1: "hello NexusClientUtils"
};

gpii.tests.nexusClient.writeNexusDefaults.testDefs = [
    {
        name: "NexusClientUtils writeNexusDefaults tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexusClient.writeNexusDefaults.newGrade",
        sequence: [
            {
                task: "gpii.writeNexusDefaults",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "{tests}.options.testGradeName",
                    gpii.tests.nexusClient.writeNexusDefaults.newGradeOptions
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
                        gradeNames: ["fluid.component", "gpii.tests.nexusClient.writeNexusDefaults.newGrade"],
                        name1: "hello NexusClientUtils"
                    }
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexusClient.writeNexusDefaults.testDefs);
