/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = fluid || require("infusion");
var WebSocket = WebSocket || fluid.require("ws");

// TODO: Support peer management in browser

(function () {
    fluid.defaults("fluid.nexusWebSocketBoundComponent", {
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
                funcName: "fluid.nexusWebSocketBoundComponent.messageListener",
                args: [
                    "{that}",
                    "{that}.nexusBoundModelPath",
                    "{arguments}.0" // message event object
                ]
            },
            sendModelChangeToNexus: {
                funcName: "fluid.nexusWebSocketBoundComponent.sendModelChangeToNexus",
                args: [
                    "{that}.websocket",
                    "{arguments}.0" // value
                ]
            },
            destroyNexusPeerComponent: {
                funcName: "fluid.nexusWebSocketBoundComponent.destroyPeer",
                args: [ "{that}", "{that}.events.onPeerDestroyed" ]
            }
        },
        events: {
            onPeerConstructed: null,
            onErrorConstructingPeer: null,
            onWebsocketConnected: null,
            onPeerDestroyed: null
        },
        listeners: {
            "onCreate.constructPeer": {
                funcName: "fluid.nexusWebSocketBoundComponent.constructPeer",
                args: [
                    "{that}",
                    "{that}.events.onPeerConstructed",
                    "{that}.events.onErrorConstructingPeer"
                ]
            },
            "onPeerConstructed.bindNexusModel": {
                funcName: "fluid.nexusWebSocketBoundComponent.bindModel",
                args: [
                    "{that}",
                    "{that}.receivesChangesFromNexus",
                    "{that}.nexusMessageListener",
                    "{that}.events.onWebsocketConnected"
                ]
            },
            "onWebsocketConnected.registerModelListenerForNexus": {
                funcName: "fluid.nexusWebSocketBoundComponent.registerModelListener",
                args: [
                    "{that}.sendsChangesToNexus",
                    "{that}.applier",
                    "{that}.nexusBoundModelPath",
                    "{that}.sendModelChangeToNexus"
                ]
            }
        }
    });

    fluid.nexusWebSocketBoundComponent.constructPeer = function (that, onPeerConstructedEvent, onErrorConstructingPeerEvent) {
        if (that.managesPeer) {
            fluid.constructNexusPeer(
                that.nexusHost,
                that.nexusPort,
                that.nexusPeerComponentPath,
                that.nexusPeerComponentOptions
            ).then(function () {
                onPeerConstructedEvent.fire();
            }, function (error) {
                // TODO: What's the best mechanism to communicate failure to construct the peer?
                onErrorConstructingPeerEvent.fire(error);
            });
        } else {
            onPeerConstructedEvent.fire();
        }
    };

    fluid.nexusWebSocketBoundComponent.destroyPeer = function (that, onPeerDestroyedEvent) {
        fluid.destroyNexusPeer(
            that.nexusHost,
            that.nexusPort,
            that.nexusPeerComponentPath
        ).then(function () {
            onPeerDestroyedEvent.fire();
        });
    };

    fluid.nexusWebSocketBoundComponent.bindModel = function (that, shouldRegisterMessageListener, messageListener, onWebsocketConnectedEvent) {
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
        that.websocket.onopen = function () {
            onWebsocketConnectedEvent.fire();
        };
    };

    fluid.nexusWebSocketBoundComponent.registerModelListener = function (shouldRegisterModelChangeListener, applier, modelPath, modelChangeListener) {
        if (shouldRegisterModelChangeListener) {
            // TODO: Segs here?
            applier.modelChanged.addListener(modelPath, modelChangeListener);
        }
    };

    fluid.nexusWebSocketBoundComponent.messageListener = function (that, modelPath, evt) {
        var value = JSON.parse(evt.data);
        fluid.nexusWebSocketBoundComponent.updateModel(that, modelPath, value);
    };

    fluid.nexusWebSocketBoundComponent.sendModelChangeToNexus =  function (websocket, value) {
        websocket.send(JSON.stringify({
            path: "",
            value: value
        }));
    };

    fluid.nexusWebSocketBoundComponent.updateModel = function (component, modelPath, value) {
        var oldValue = fluid.get(component.model, modelPath);
        var changes = fluid.modelPairToChanges(value, oldValue, modelPath);
        fluid.fireChanges(component.applier, changes);
    };

}());
