var fluid_2_0_0 = fluid_2_0_0 || require("infusion");
var WebSocket = WebSocket || fluid.require("ws");

// TODO: Support peer management in browser

(function (fluid, WebSocket) {
    "use strict";

    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.nexusWebSocketBoundComponent", {
        gradeNames: "fluid.modelComponent",
        members: {
            nexusHost: "localhost",
            nexusPort: 9081,
            nexusPeerComponentPath: "", // To be supplied by users of the grade
            nexusBoundModelPath: "",
            sendsChangesToNexus: false,
            receivesChangesFromNexus: false,
            managesPeer: false,
            nexusPeerComponentOptions: null, // Will be used if managesPeer is true
            websocket: null // Will be set at onCreate
        },
        invokers: {
            nexusMessageListener: {
                funcName: "gpii.nexusWebSocketBoundComponent.messageListener",
                args: [
                    "{arguments}.0",
                    "{that}.nexusBoundModelPath",
                    "{that}.applier"
                ]
            },
            sendModelChangeToNexus: {
                funcName: "gpii.nexusWebSocketBoundComponent.sendModelChangeToNexus",
                args: [
                    "{that}.websocket",
                    "{arguments}.0" // value
                ]
            },
            destroyNexusPeerComponent: {
                funcName: "gpii.nexusWebSocketBoundComponent.destroyPeer",
                args: [ "{that}", "{that}.events.onPeerDestroyed" ]
            }
        },
        events: {
            onPeerConstructed: null,
            onWebsocketConnected: null,
            onPeerDestroyed: null
        },
        listeners: {
            "onCreate.constructPeer": {
                funcName: "gpii.nexusWebSocketBoundComponent.constructPeer",
                args: [ "{that}", "{that}.events.onPeerConstructed" ]
            },
            "onPeerConstructed.bindNexusModel": {
                funcName: "gpii.nexusWebSocketBoundComponent.bindModel",
                args: [
                    "{that}",
                    "{that}.receivesChangesFromNexus",
                    "{that}.nexusMessageListener",
                    "{that}.events.onWebsocketConnected"
                ]
            },
            "onWebsocketConnected.registerModelListenerForNexus": {
                funcName: "gpii.nexusWebSocketBoundComponent.registerModelListener",
                args: [
                    "{that}.sendsChangesToNexus",
                    "{that}.applier",
                    "{that}.nexusBoundModelPath",
                    "{that}.sendModelChangeToNexus"
                ]
            }
        }
    });

    gpii.nexusWebSocketBoundComponent.constructPeer = function (that, onPeerConstructedEvent) {
        if (that.managesPeer) {
            gpii.constructNexusPeer(
                that.nexusHost,
                that.nexusPort,
                that.nexusPeerComponentPath,
                that.nexusPeerComponentOptions
            ).then(function () {
                onPeerConstructedEvent.fire();
            });
        } else {
            onPeerConstructedEvent.fire();
        }
    };

    gpii.nexusWebSocketBoundComponent.destroyPeer = function (that, onPeerDestroyedEvent) {
        gpii.destroyNexusPeer(
            that.nexusHost,
            that.nexusPort,
            that.nexusPeerComponentPath
        ).then(function () {
            onPeerDestroyedEvent.fire();
        });
    };

    gpii.nexusWebSocketBoundComponent.bindModel = function (that, shouldRegisterMessageListener, messageListener, onWebsocketConnectedEvent) {
        var bindModelUrl = fluid.stringTemplate("ws://%host:%port/bindModel/%componentPath/%modelPath", {
            host: that.nexusHost,
            port: that.nexusPort,
            componentPath: that.nexusPeerComponentPath,
            modelPath: that.nexusBoundModelPath
        });
        that.websocket = new WebSocket(bindModelUrl);
        if (shouldRegisterMessageListener) {
            that.websocket.onmessage = messageListener;
        }
        onWebsocketConnectedEvent.fire();
    };

    gpii.nexusWebSocketBoundComponent.registerModelListener = function (shouldRegisterModelChangeListener, applier, modelPath, modelChangeListener) {
        if (shouldRegisterModelChangeListener) {
            // TODO: Segs here?
            applier.modelChanged.addListener(modelPath, modelChangeListener);
        }
    };

    gpii.nexusWebSocketBoundComponent.messageListener = function (evt, modelPath, applier) {
        var value = JSON.parse(evt.data);
        applier.change(modelPath, value);
    };

    gpii.nexusWebSocketBoundComponent.sendModelChangeToNexus =  function (websocket, value) {
        websocket.send(JSON.stringify({
            path: "",
            value: value
        }));
    };

}(fluid_2_0_0, WebSocket));
