/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    fs = require("fs"),
    gpii = fluid.registerNamespace("gpii"),
    program = require("commander");

require("./index.js");

// Defaults
var nexusHost = "localhost";
var nexusPort = 9081;

program
    .usage("[options] <file>")
    .option("-H, --host <hostname>", "Host of Nexus (default: " + nexusHost + ")")
    .option("-p, --port <portnumber>", "Port number of Nexus (default: " + nexusPort + ")")
    .parse(process.argv);

if (program.args.length === 0) {
    console.error("Error: Configuration filename missing");
    process.exit(1);
} else if (program.args.length !== 1) {
    console.error("Error: Please specify exactly one filename");
    process.exit(1);
}

var configFilename = program.args[0];

if (program.host) {
    nexusHost = program.host;
}

if (program.port) {
    nexusPort = program.port;
}

var nexusConfig = JSON.parse(fs.readFileSync(configFilename));

var tasks = [];

fluid.each(nexusConfig.defaults, function (options, gradeName) {
    tasks.push(function () {
        return gpii.writeNexusDefaults(nexusHost, nexusPort, gradeName, options);
    });
});

fluid.each(nexusConfig.components, function (options, componentPath) {
    tasks.push(function () {
        return gpii.constructNexusPeer(nexusHost, nexusPort, componentPath, options);
    });
});

fluid.promise.sequence(tasks).then(function () {
    // SUCCESS
}, function (error) {
    console.error(error.message);
});
