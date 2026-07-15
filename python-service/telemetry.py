from azure.monitor.opentelemetry import configure_azure_monitor
import os

configure_azure_monitor(
    connection_string=os.environ.get("APPLICATIONINSIGHTS_CONNECTION_STRING")
)

print("Azure Monitor initialized")
