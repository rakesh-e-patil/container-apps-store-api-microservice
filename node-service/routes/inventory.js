const appInsights = require("applicationinsights");
var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const inventoryService = process.env.INVENTORY_SERVICE_NAME || 'go-app';
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

//use dapr http proxy (header) to call inventory service with normal /inventory route URL in axios.get call
const daprSidecar = `http://localhost:${daprPort}`
//const daprSidecar = `http://localhost:${daprPort}/v1.0/invoke/${inventoryService}/method`

/* GET users listing. */
router.get('/', async function(req, res, next) {

    const client = appInsights.defaultClient;

    const operation = client.startOperation(req, "Inventory Lookup");

    await appInsights.wrapWithCorrelationContext(async () => {

        const span = client.startDependency({
            target: inventoryService,
            name: "Inventory Service Call",
            data: `/inventory?id=${req.query.id}`,
            dependencyTypeName: "HTTP"
        });

        try {

            const data = await axios.get(
                `${daprSidecar}/inventory?id=${req.query.id}`,
                {
                    headers: {
                        'dapr-app-id': inventoryService
                    }
                }
            );

            span.success = true;
            client.trackDependency(span);

            res.send(`Inventory status for ${req.query.id}:\n${data.data}`);

        } catch(err){

            span.success = false;
            client.trackDependency(span);

            client.trackException({
                exception: err
            });

            next(err);
        }

    }, operation.context);
});
module.exports = router;
