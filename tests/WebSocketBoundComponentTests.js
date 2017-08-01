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

fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndSendsUpdates");
fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndReceivesUpdates");

// Base testCaseHolder

fluid.defaults("gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder", {
    gradeNames: ["gpii.test.nexus.testCaseHolder"],
    testComponentPath: "nexusWebSocketBoundComponentPeer",
    clientManagesPeer: false,
    clientSendsChangesToNexus: false,
    clientReceivesChangesFromNexus: false,
    components: {
        client: {
            type: "gpii.nexusWebSocketBoundComponent",
            options: {
                members: {
                    nexusHost: "localhost",
                    nexusPort: "{configuration}.options.serverPort",
                    nexusPeerComponentPath: "{tests}.options.testComponentPath",
                    nexusPeerComponentOptions: {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "hello"
                        }
                    },
                    nexusBoundModelPath: "valueA",
                    managesPeer: "{tests}.options.clientManagesPeer",
                    sendsChangesToNexus: "{tests}.options.clientSendsChangesToNexus",
                    receivesChangesFromNexus: "{tests}.options.clientReceivesChangesFromNexus"
                },
                model: {
                    valueA: "hello"
                }
            }
        }
    }
});

// Tests

gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndSendsUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manages peer and sends updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        clientManagesPeer: true,
        clientSendsChangesToNexus: true,
        clientReceivesChangesFromNexus: false,
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Peer not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            // TODO: Construct client or initiate connection here
            {
                event: "{client}.events.onWebsocketConnected",
                listener: "fluid.identity"
            },
            // Change the model value in the client
            {
                func: "{client}.applier.change(valueA, updated)"
            },
            // Verify that the peer in the Nexus is updated
            {
                changeEvent: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Peer model has been updated",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "updated"
                    }
                ]
            }
        ]
    }
];

gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndReceivesUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manages peer and receives updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 2,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        clientManagesPeer: true,
        clientSendsChangesToNexus: false,
        clientReceivesChangesFromNexus: true,
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Peer not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            // TODO: Construct client or initiate connection here
            {
                event: "{client}.events.onWebsocketConnected",
                listener: "fluid.identity"
            },
            // Change the model value in the Nexus peer
            {
                func: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.change(valueA, updated)"
            },
            // Verify that the client is updated
            {
                changeEvent: "{client}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "Client model has been updated",
                    {
                        valueA: "updated"
                    },
                    "{client}.model"
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndSendsUpdates.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.managesPeerAndReceivesUpdates.testDefs);
