/*!
GPII Infusion/Express Middleware

Copyright 2012 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function () {

    "use strict";

    var fluid = require("infusion"),
        express = require("express"),
        gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.middleware", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "gpii.middleware.finalInit",
        components: {
            requests: "{requests}",
            server: "{gpii.server}.server"
        },
        invokers: {
            resolveEventName: "gpii.middleware.resolveEventName",
            handle: {
                funcName: "gpii.middleware.handle",
                args: "{arguments}.0"
            }
        }
    });

    gpii.middleware.finalInit = function (that) {
        that.requests.events.registerMiddleware.fire(that);
        that.server.use(function (req, res, next) {
            var eventName = that.resolveEventName();
            req.fluidRequest.events[eventName].fire(req.fluidRequest);
        });
    };

    fluid.demands("gpii.middleware.resolveEventName", null, {
        funcName: "gpii.middleware.resolveEventName",
        args: "{middleware}.typeName"
    });

    gpii.middleware.resolveEventName = function (typeName) {
        var eventName = fluid.computeNickName(typeName);
        return "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    };

    fluid.defaults("gpii.middleware.bodyParser", {
        gradeNames: ["gpii.middleware", "autoInit"],
        invokers: {
            handle: {
                funcName: "gpii.middleware.bodyParserHandle"
            }
        }
    });
    gpii.middleware.bodyParserHandle = function (request) {
        var parser = express.bodyParser();
        parser(request.req, request.res, request.next);
    };
    fluid.demands("bodyParser", "kettle.server", {
        funcName: "kettle.middleware.bodyParser"
    });

})();