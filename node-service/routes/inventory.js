const appInsights = require("applicationinsights");
var express = require('express');
var router = express.Router();
const axios = require('axios').default;

const inventoryService = process.env.INVENTORY_SERVICE_NAME || 'go-app';
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprSidecar = `http://localhost:${daprPort}`;

router.get('/', async function(req, res, next) {

    const client = appInsights.defaultClient;
    const start = Date.now();

    try {

        const data = await axios.get(
            `${daprSidecar}/inventory?id=${req.query.id}`,
            {
                headers: {
                    'dapr-app-id': inventoryService
                }
            }
        );

        if (client) {
            client.trackDependency({
                target: inventoryService,
                name: "Inventory Service Call",
                data: `/inventory?id=${req.query.id}`,
                duration: Date.now() - start,
                success: true,
                dependencyTypeName: "HTTP",
                resultCode: 200
            });
        }

        res.send(`Inventory status for ${req.query.id}:\n${data.data}`);

    } catch(err) {

        if (client) {
            client.trackDependency({
                target: inventoryService,
                name: "Inventory Service Call",
                data: `/inventory?id=${req.query.id}`,
                duration: Date.now() - start,
                success: false,
                dependencyTypeName: "HTTP",
                resultCode: err.response ? err.response.status : 500
            });
            client.trackException({ exception: err });
        }

        next(err);
    }

});

module.exports = router;
