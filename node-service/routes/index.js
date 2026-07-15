const appInsights = require("applicationinsights");
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {

    const client = appInsights.defaultClient;

    // Track page visit
    client.trackTrace({
        message: "Home page opened",
        properties: {
            Route: "/",
            Method: "GET"
        }
    });

    // Track a business event
    client.trackEvent({
        name: "HomePageVisited"
    });

    res.render("index", {
        title: "Container Apps Demo"
    });

});

module.exports = router;
