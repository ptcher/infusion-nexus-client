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
                    "{that}",
                    "{that}.nexusBoundModelPath",
                    "{arguments}.0" // message event object
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
            onPeerDestroyed: null,
            onWebsocketConnected: null,
            onError: null
        },
        listeners: {
            "onCreate.constructPeer": {
                funcName: "gpii.nexusWebSocketBoundComponent.constructPeer",
                args: [
                    "{that}",
                    "{that}.events.onPeerConstructed",
                    "{that}.events.onError"
                ]
            },
            "onPeerConstructed.bindNexusModel": {
                funcName: "gpii.nexusWebSocketBoundComponent.bindModel",
                args: [
                    "{that}",
                    "{that}.receivesChangesFromNexus",
                    "{that}.nexusMessageListener",
                    "{that}.events.onWebsocketConnected",
                    "{that}.events.onError"
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

    gpii.nexusWebSocketBoundComponent.constructPeer = function (that, onPeerConstructedEvent, onErrorEvent) {
        if (that.managesPeer) {
            gpii.constructNexusPeer(that.nexusHost, that.nexusPort,
                that.nexusPeerComponentPath, that.nexusPeerComponentOptions
            ).then(function () {
                onPeerConstructedEvent.fire();
            }, function (error) {
                onErrorEvent.fire(error);
            });
        } else {
            onPeerConstructedEvent.fire();
        }
    };

    gpii.nexusWebSocketBoundComponent.destroyPeer = function (that, onPeerDestroyedEvent) {
        gpii.destroyNexusPeer(that.nexusHost, that.nexusPort,
            that.nexusPeerComponentPath
        ).then(function () {
            onPeerDestroyedEvent.fire();
        });
    };

    gpii.nexusWebSocketBoundComponent.bindModel = function (that, shouldRegisterMessageListener, messageListener, onWebsocketConnectedEvent, onErrorEvent) {
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
        that.websocket.onerror = function (error) {
            onErrorEvent.fire(error);
        };
    };

    gpii.nexusWebSocketBoundComponent.registerModelListener = function (shouldRegisterModelChangeListener, applier, modelPath, modelChangeListener) {
        if (shouldRegisterModelChangeListener) {
            // TODO: Segs here?
            applier.modelChanged.addListener(modelPath, modelChangeListener);
        }
    };

    gpii.nexusWebSocketBoundComponent.messageListener = function (that, modelPath, evt) {
        var value = JSON.parse(evt.data);
        gpii.nexusWebSocketBoundComponent.setModel(that, modelPath, value);
    };

    gpii.nexusWebSocketBoundComponent.sendModelChangeToNexus =  function (websocket, value) {
        websocket.send(JSON.stringify({
            path: "",
            value: value
        }));
    };

    // TODO: Move somewhere central and make suitable for general usage
    // TODO: This really needs tests
    gpii.nexusWebSocketBoundComponent.setModel = function (component, path, value) {
        var oldValue = fluid.get(component.model, path);

        var diffOptions = {changes: 0, unchanged: 0, changeMap: {}};
        fluid.model.diff(oldValue, value, diffOptions);

        gpii.nexusWebSocketBoundComponent.applyModelChanges(
            component,
            fluid.pathUtil.parseEL(path),
            value,
            diffOptions.changeMap,
            []
        );
    };

    gpii.nexusWebSocketBoundComponent.applyModelChanges = function (component, targetModelSegs, value, changeMap, changeSegs) {
        if (changeMap === "ADD") {
            // The whole model value is new
            component.applier.change(targetModelSegs, value, "ADD");
        } else if (fluid.isPlainObject(changeMap, true)) {
            // Something within the model value has changed
            fluid.each(changeMap, function (change, seg) {
                var currentChangeSegs = changeSegs.concat([seg]);
                if (change === "ADD") {
                    component.applier.change(
                        targetModelSegs.concat(currentChangeSegs),
                        fluid.get(value, currentChangeSegs),
                        "ADD"
                    );
                } else if (change === "DELETE") {
                    component.applier.change(
                        targetModelSegs.concat(currentChangeSegs),
                        null,
                        "DELETE"
                    );
                } else if (fluid.isPlainObject(change, true)) {
                    // Recurse down the tree of changes
                    gpii.nexusWebSocketBoundComponent.applyModelChanges(
                        component,
                        targetModelSegs,
                        value,
                        change,
                        currentChangeSegs
                    );
                }
            });
        }
    };


}(fluid_2_0_0, WebSocket));
