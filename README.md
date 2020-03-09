Nexus Client
============

This repository contains code to aid in the creation of clients for the
[Infusion Nexus](https://github.com/fluid-project/infusion-nexus).

For examples of usage, please see: https://github.com/fluid-project/infusion-nexus-demos

`fluid.nexusWebSocketBoundComponent` Infusion grade
--------------------------------------------------

The `fluid.nexusWebSocketBoundComponent` grade provides functionality for
making an Infusion component that has a binding to a Nexus peer:

- Construction and destruction of Nexus peer
- WebSocket connection to bind local component model to Nexus peer model

Utility functions
-----------------

### fluid.writeNexusDefaults(host, port, gradeName, gradeDefaults)

Writes grade defaults on a remote Nexus.

### fluid.constructNexusPeer(host, port, componentPath, componentOptions)

Constructs a component on a remote Nexus.

### fluid.destroyNexusPeer(host, port, componentPath)

Destroys a component on a remote Nexus.
