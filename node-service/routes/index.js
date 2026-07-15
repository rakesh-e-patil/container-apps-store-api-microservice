const appInsights = require("applicationinsights");
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {

    const client = appInsights.defaultClient;

    if (client) {
        client.trackTrace({
            message: "Home page opened",
            properties: { Route: "/", Method: "GET" }
        });
        client.trackEvent({ name: "HomePageVisited" });
    }

    res.render("index", {
        title: "Container Apps Demo"
    });

});

module.exports = router;
