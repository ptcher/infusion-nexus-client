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

fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates");
fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates");
fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates");
fluid.registerNamespace("gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates");

// Base testCaseHolder

fluid.defaults("gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder", {
    gradeNames: ["gpii.test.nexus.testCaseHolder"],
    testComponentPath: "nexusWebSocketBoundComponentPeer",
    clientManagesPeer: false,
    clientSendsChangesToNexus: false,
    clientReceivesChangesFromNexus: false,
    events: {
        createClient: null
    },
    components: {
        boundComponent: {
            type: "gpii.nexusWebSocketBoundComponent",
            createOnEvent: "{tests}.events.createClient",
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

gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manage peer and send updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
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
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that gpii.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Change the model value in the boundComponent
            {
                func: "{boundComponent}.applier.change(valueA, updated)"
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
            },
            // Destroy the Nexus peer via the boundComponent
            {
                func: "{boundComponent}.destroyNexusPeerComponent"
            },
            {
                event: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.events.onDestroy",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            },
            {
                event: "{boundComponent}.events.onPeerDestroyed",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            }
        ]
    }
];

gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent manage peer and receive updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 5,
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
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that gpii.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Change the model value in the Nexus peer
            {
                func: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.change(valueA, updated)"
            },
            // Verify that the boundComponent is updated
            {
                changeEvent: "{boundComponent}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "boundComponent model has been updated",
                    {
                        valueA: "updated"
                    },
                    "{boundComponent}.model"
                ]
            },
            // Destroy the Nexus peer via the boundComponent
            {
                func: "{boundComponent}.destroyNexusPeerComponent"
            },
            {
                event: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.events.onDestroy",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            },
            {
                event: "{boundComponent}.events.onPeerDestroyed",
                listener: "jqUnit.assert",
                args: ["Peer destroyed"]
            }
        ]
    }
];

gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent do not manage peer and send updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        clientManagesPeer: false,
        clientSendsChangesToNexus: true,
        clientReceivesChangesFromNexus: false,
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
            // Construct peer
            {
                task: "{nexusClient}.constructComponent",
                args: [
                    "{tests}.options.testComponentPath",
                    {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "constructed before boundComponent"
                        }
                    }
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Nexus peer constructed"]
            },
            // Construct boundComponent
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that gpii.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Check that construction of the boundComponent didn't alter the peer
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Peer model is unchanged",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "constructed before boundComponent"
                    }
                ]
            },
            // Change the model value in the boundComponent
            {
                func: "{boundComponent}.applier.change(valueA, updated)"
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

gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates.testDefs = [
    {
        name: "nexusWebSocketBoundComponent do not manage peer and receive updates tests",
        gradeNames: "gpii.tests.nexusClient.webSocketBoundComponent.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        clientManagesPeer: false,
        clientSendsChangesToNexus: false,
        clientReceivesChangesFromNexus: true,
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
            // Construct peer
            {
                task: "{nexusClient}.constructComponent",
                args: [
                    "{tests}.options.testComponentPath",
                    {
                        type: "fluid.modelComponent",
                        model: {
                            valueA: "constructed before boundComponent"
                        }
                    }
                ],
                resolve: "jqUnit.assert",
                resolveArgs: ["Nexus peer constructed"]
            },
            // Construct boundComponent
            {
                func: "{tests}.events.createClient.fire"
            },
            {
                event: "{that gpii.nexusWebSocketBoundComponent}.events.onWebsocketConnected",
                listener: "jqUnit.assert",
                args: ["WebSocket connected"]
            },
            // Check that construction of the boundComponent didn't alter the peer
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Peer model is unchanged",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        valueA: "constructed before boundComponent"
                    }
                ]
            },
            // We will get a message with the initial peer model value
            {
                changeEvent: "{boundComponent}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "boundComponent model has been set to the initial peer model value",
                    {
                        valueA: "constructed before boundComponent"
                    },
                    "{boundComponent}.model"
                ]
            },
            // Change the model value in the Nexus peer
            {
                func: "{gpii.tests.nexus.componentRoot}.nexusWebSocketBoundComponentPeer.applier.change(valueA, updated)"
            },
            // Verify that the boundComponent is updated
            {
                changeEvent: "{boundComponent}.applier.modelChanged",
                path: "valueA"
            },
            {
                func: "jqUnit.assertDeepEq",
                args: [
                    "boundComponent model has been updated",
                    {
                        valueA: "updated"
                    },
                    "{boundComponent}.model"
                ]
            }
        ]
    }
];

// Test error cases with no Nexus running

fluid.defaults("gpii.tests.nexusClient.webSocketBoundComponent.noNexusTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    serverHost: "localhost",
    serverPort: 8082,
    events: {
        createClient: null
    },
    components: {
        boundComponent: {
            type: "gpii.nexusWebSocketBoundComponent",
            createOnEvent: "{testEnvironment}.events.createClient",
            options: {
                members: {
                    nexusHost: "{testEnvironment}.options.serverHost",
                    nexusPort: "{testEnvironment}.options.serverPort",
                    nexusPeerComponentPath: "someComponentPath",
                    managesPeer: true,
                    nexusPeerComponentOptions: {
                        type: "fluid.component"
                    }
                }
            }
        },
        noNexusTester: {
            type: "gpii.tests.nexusClient.webSocketBoundComponent.noNexusTester"
        }
    }
});

fluid.defaults("gpii.tests.nexusClient.webSocketBoundComponent.noNexusTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "nexusWebSocketBoundComponent No Nexus tests",
        tests: [
            {
                name: "Expect error constructing peer",
                expect: 1,
                sequence: [
                    {
                        func: "{testEnvironment}.events.createClient.fire"
                    },
                    {
                        event: "{testEnvironment gpii.nexusWebSocketBoundComponent}.events.onErrorConstructingPeer",
                        listener: "jqUnit.assert",
                        args: ["Error constructing peer"]
                    }
                ]
            }
        ]
    }]
});

kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndSendUpdates.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.managePeerAndReceiveUpdates.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndSendUpdates.testDefs);
kettle.test.bootstrapServer(gpii.tests.nexusClient.webSocketBoundComponent.noManagePeerAndReceiveUpdates.testDefs);
fluid.test.runTests(["gpii.tests.nexusClient.webSocketBoundComponent.noNexusTestTree"]);
