from azure.monitor.opentelemetry import configure_azure_monitor
import os

connection_string = os.environ.get("APPLICATIONINSIGHTS_CONNECTION_STRING")

if connection_string:
    configure_azure_monitor(connection_string=connection_string)
    print("Azure Monitor initialized")
else:
    print("APPLICATIONINSIGHTS_CONNECTION_STRING not set — Azure Monitor disabled")
