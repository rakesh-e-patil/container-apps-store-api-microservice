const appInsights = require("applicationinsights");
const express = require("express");
const router = express.Router();
const axios = require("axios").default;

const orderService = process.env.ORDER_SERVICE_NAME || "python-app";
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

const daprSidecar = `http://localhost:${daprPort}`;

const client = appInsights.defaultClient;


/*----------------------------------------------------
 GET Order
----------------------------------------------------*/
router.get("/", async function (req, res, next) {

    const start = Date.now();

    try {

        client.trackTrace({
            message: "Order GET Request",
            properties: {
                OrderId: req.query.id
            }
        });

        console.log(`Calling ${daprSidecar}/order?id=${req.query.id}`);

        const response = await axios.get(
            `${daprSidecar}/order?id=${req.query.id}`,
            {
                headers: {
                    "dapr-app-id": orderService
                }
            }
        );

        client.trackDependency({
            target: orderService,
            name: "GET Order",
            data: "/order",
            duration: Date.now() - start,
            success: true,
            dependencyTypeName: "HTTP"
        });

        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(response.data));

    }
    catch (err) {

        client.trackDependency({
            target: orderService,
            name: "GET Order",
            data: "/order",
            duration: Date.now() - start,
            success: false,
            dependencyTypeName: "HTTP"
        });

        client.trackException({
            exception: err
        });

        next(err);
    }

});


/*----------------------------------------------------
 CREATE ORDER
----------------------------------------------------*/
router.post("/", async function (req, res, next) {

    const start = Date.now();

    try {

        client.trackEvent({
            name: "Order Placement Started",
            properties: {
                Product: req.body.productId,
                Quantity: req.body.quantity
            }
        });

        let order = req.body;

        order.location = "Seattle";
        order.priority = "Standard";

        console.log(
            `Calling ${daprSidecar}/order?id=${req.query.id}`
        );

        const response = await axios.post(
            `${daprSidecar}/order?id=${req.query.id}`,
            order,
            {
                headers: {
                    "dapr-app-id": orderService
                }
            }
        );

        client.trackDependency({
            target: orderService,
            name: "POST Order",
            data: "/order",
            duration: Date.now() - start,
            success: true,
            dependencyTypeName: "HTTP"
        });

        client.trackEvent({
            name: "Order Placement Completed",
            properties: {
                Status: "Success"
            }
        });

        res.send(
            `<p>Order created!</p><br/><code>${JSON.stringify(response.data)}</code>`
        );

    }
    catch (err) {

        client.trackDependency({
            target: orderService,
            name: "POST Order",
            data: "/order",
            duration: Date.now() - start,
            success: false,
            dependencyTypeName: "HTTP"
        });

        client.trackException({
            exception: err
        });

        res.send(
            `<p>Error creating order.</p><br/><code>${err}</code>`
        );
    }

});


/*----------------------------------------------------
 DELETE ORDER
----------------------------------------------------*/
router.post("/delete", async function (req, res, next) {

    const start = Date.now();

    try {

        const response = await axios.delete(
            `${daprSidecar}/order?id=${req.body.id}`,
            {
                headers: {
                    "dapr-app-id": orderService
                }
            }
        );

        client.trackDependency({
            target: orderService,
            name: "DELETE Order",
            data: "/order",
            duration: Date.now() - start,
            success: true,
            dependencyTypeName: "HTTP"
        });

        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(response.data));

    }
    catch (err) {

        client.trackDependency({
            target: orderService,
            name: "DELETE Order",
            data: "/order",
            duration: Date.now() - start,
            success: false,
            dependencyTypeName: "HTTP"
        });

        client.trackException({
            exception: err
        });

        next(err);
    }

});

module.exports = router;
