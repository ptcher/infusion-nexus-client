/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");

var tests = [
    "./ConstructAndDestroyTests.js",
    "./WebSocketBoundComponentTests.js",
    "./WriteNexusDefaultsTests.js"
];

fluid.each(tests, function (path) {
    require(path);
});
