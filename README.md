Nexus Client
============

This repository contains code to aid in the creation of clients for the
[GPII Nexus](https://github.com/GPII/nexus).

For examples of usage, please see: https://github.com/simonbates/nexus-demos

`gpii.nexusWebSocketBoundComponent` Infusion grade
--------------------------------------------------

The `gpii.nexusWebSocketBoundComponent` grade provides functionality for
making an Infusion component that has a binding to a Nexus peer:

- Construction and destruction of Nexus peer
- WebSocket connection to bind local component model to Nexus peer model

Utility functions
-----------------

### gpii.writeNexusDefaults(host, port, gradeName, gradeDefaults)

Writes grade defaults on a remote Nexus.

### gpii.constructNexusPeer(host, port, componentPath, componentOptions)

Constructs a component on a remote Nexus.

### gpii.destroyNexusPeer(host, port, componentPath)

Destroys a component on a remote Nexus.

### gpii.addNexusRecipe(host, port, recipeName, recipeContents)

Adds a Co-Occurrence Engine recipe to a remote Nexus.
