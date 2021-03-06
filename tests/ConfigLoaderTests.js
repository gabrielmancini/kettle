/**
 * Kettle Config Loader Tests
 *
 * Copyright 2013 OCAD University
 * Copyright 2012-2014 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/GPII/kettle/LICENSE.txt
 */
 
"use strict";

var fluid = require("infusion"),
    path = require("path"),
    kettle = require("../kettle.js"), // TODO: New module loader
    jqUnit = fluid.require("jqUnit"),
    configPath = path.resolve(__dirname, "./configs");

kettle.loadTestingSupport();

fluid.defaults("kettle.tests.configLoader", {
    gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    components: {
        configLoaderTester: {
            type: "kettle.tests.configLoaderTester"
        }
    }
});

fluid.defaults("kettle.tests.subcomponent1", {
    gradeNames: ["autoInit", "fluid.littleComponent"],
    option: "ORIGINAL"
});

fluid.defaults("kettle.tests.subcomponent2", {
    gradeNames: ["autoInit", "fluid.modelComponent"]
});

fluid.defaults("kettle.tests.subcomponent3", {
    gradeNames: ["autoInit", "fluid.littleComponent"],
    option: "OVERRIDE"
});

var expectedDefaults = {
    config1: {
        gradeNames: ["config1", "fluid.littleComponent", "kettle.config", "config2",
            "fluid.eventedComponent", "config4", "config3",
            "fluid.modelComponent", "fluid.commonModelComponent", "autoInit"],
        components: {
            subcomponent1: {
                type: "kettle.tests.subcomponent1",
                options: {
                    gradeNames: ["kettle.tests.subcomponent3"]
                }
            }
        },
        option1: "OPTION1",
        option2: "OPTION2",
        option3: "OPTION3"
    },
    config2: {
        gradeNames: ["config2", "fluid.eventedComponent", "fluid.littleComponent", "kettle.config", "config4"],
        components: {
            subcomponent1: {
                type: "kettle.tests.subcomponent1",
                options: {
                    gradeNames: ["kettle.tests.subcomponent3"]
                }
            }
        },
        option2: "OPTION2"
    },
    config3: {
        gradeNames: ["config3", "fluid.modelComponent", "fluid.commonModelComponent", "fluid.littleComponent", "kettle.config"],
        components: {
            subcomponent1: {
                options: {
                    gradeNames: ["kettle.tests.subcomponent2"]
                }
            }
        },
        option3: "OPTION3"
    },
    config4: {
        gradeNames: ["config4", "kettle.config", "fluid.littleComponent"],
        components: {
            subcomponent1: {
                options: {
                    gradeNames: ["kettle.tests.subcomponent3"]
                }
            }
        }
    },
    config5: { // never becomes a top-level config and so does not acquire the kettle.config grade
        gradeNames: ["config5", "config6", "fluid.littleComponent"],
        option6: "OPTION6"
    },
    config6: {
        gradeNames: ["config6", "fluid.littleComponent", "kettle.config", "autoInit"],
        option6: "OPTION6"
    }
};

var expectedSubcomponentOptions = {
    gradeNames: ["kettle.tests.subcomponent3", "fluid.littleComponent",
        "kettle.tests.subcomponent1", "autoInit"],
    option: "OVERRIDE"
};

kettle.tests.testConfigToGrade = function (headName, configNames) {
    var componentName = kettle.config.createDefaults({
            configName: configNames[0],
            configPath: configPath
        });
    var expectedParents = fluid.copy(configNames);

    if (headName) {
        jqUnit.assertEquals("Head component name is correct", headName, componentName);
    } else {
        jqUnit.assertTrue("Head component is named a nonce grade", componentName.indexOf("kettle.config.") === 0);
        expectedParents.shift(); // white box testing - in this case the system won't need to allocate a dedicated grade
    }
    jqUnit.assertValue("Head component defaults are allocated", fluid.defaults(componentName));

    fluid.each(expectedParents, function (configOrTypeName) {
        var defaults = fluid.defaults(configOrTypeName);
        jqUnit.assertValue("Grade is created for config " + configOrTypeName, defaults);
        jqUnit.assertLeftHand("Config " + configOrTypeName +
            " is correctly converted into a grade",
            expectedDefaults[configOrTypeName], defaults);
    });
};

kettle.tests.testCreateDefaults = function () {
    kettle.tests.testConfigToGrade("config1", ["config1", "config2", "config3", "config4"]);
    var config1 = fluid.invokeGlobalFunction("config1");
    jqUnit.assertLeftHand("Subcomponent options are correct",
        expectedSubcomponentOptions, config1.subcomponent1.options);
};

kettle.tests.testCreateNoTypeNameDefaults = function () {
    kettle.tests.testConfigToGrade(null, ["config5", "config6"]);
};

fluid.defaults("kettle.tests.configLoaderTester", {
    gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
    modules: [{
        name: "Config Loader",
        tests: [{
            expect: 11,
            name: "kettle.config.createDefaults",
            func: "kettle.tests.testCreateDefaults"
        }, {
            expect: 4,
            name: "kettle.config.createDefaults no typeName",
            func: "kettle.tests.testCreateNoTypeNameDefaults"
        }]
    }]
});

kettle.test.bootstrap("kettle.tests.configLoader");

