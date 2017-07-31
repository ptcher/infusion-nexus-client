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

fluid.registerNamespace("gpii.tests.nexus.nexusClientUtils");

gpii.tests.nexus.nexusClientUtils.newGradeOptions = {
    gradeNames: ["fluid.component"],
    model: {
        name1: "hello NexusClientUtils"
    }
};

gpii.tests.nexus.nexusClientUtils.testDefs = [
    {
        name: "NexusClientUtils Tests",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.nexusClientUtils.newGrade",
        sequence: [
            {
                task: "gpii.writeNexusDefaults",
                args: [
                    "localhost",
                    "{configuration}.options.serverPort",
                    "gpii.tests.nexus.nexusClientUtils.newGrade",
                    gpii.tests.nexus.nexusClientUtils.newGradeOptions
                ],
                resolve: "fluid.identity"
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
                        gradeNames: ["fluid.component", "gpii.tests.nexus.nexusClientUtils.newGrade"],
                        model: {
                            name1: "hello NexusClientUtils"
                        }
                    }
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.nexusClientUtils.testDefs);
