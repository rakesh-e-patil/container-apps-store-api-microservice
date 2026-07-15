const appInsights = require("applicationinsights");

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

if (connectionString) {
    appInsights.setup(connectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true)
        .start();
    console.log("Azure Monitor initialized");
} else {
    console.warn("APPLICATIONINSIGHTS_CONNECTION_STRING not set — Azure Monitor disabled");
}
