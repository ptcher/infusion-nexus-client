/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus-client/master/LICENSE.txt
*/

"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            all: ["**/*.js"],
            options: {
                jshintrc: true
            }
        },
        jsonlint: {
            all: ["package.json", ".jshintrc", "src/**/*.json"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("default", ["lint"]);
    grunt.registerTask("lint", "Run jshint and jsonlint", ["jshint", "jsonlint"]);
};
