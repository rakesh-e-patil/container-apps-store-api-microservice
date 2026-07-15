import os
import logging
import flask
import telemetry

from flask import request, jsonify
from flask import json
from flask_cors import CORS
from dapr.clients import DaprClient
from opentelemetry import trace

logging.basicConfig(level=logging.INFO)

tracer = trace.get_tracer("python-order-service")

app = flask.Flask(__name__)
CORS(app)


# ----------------------------------------------------
# GET ORDER
# ----------------------------------------------------
@app.route("/order", methods=["GET"])
def get_order():

    app.logger.info("Order lookup requested")

    with tracer.start_as_current_span("Get Order") as span:

        span.set_attribute("order.id", request.args.get("id", ""))

        with DaprClient() as d:
            d.wait(5)

            try:

                order_id = request.args.get("id")

                if not order_id:
                    span.set_status(trace.Status(trace.StatusCode.ERROR))
                    return jsonify('Order "id" not found'), 400

                state = d.get_state(
                    store_name="orders",
                    key=order_id
                )

                if state.data:

                    app.logger.info("Order found")

                    span.set_attribute("order.found", True)

                    return jsonify(json.loads(state.data)), 200

                else:

                    span.set_attribute("order.found", False)

                    return jsonify("No order found"), 404

            except Exception as ex:

                span.record_exception(ex)

                app.logger.exception(ex)

                return str(ex), 500

            finally:

                app.logger.info("Completed GET order")


# ----------------------------------------------------
# CREATE ORDER
# ----------------------------------------------------
@app.route("/order", methods=["POST"])
def create_order():

    app.logger.info("Create order request")

    with tracer.start_as_current_span("Create Order") as span:

        with DaprClient() as d:

            d.wait(5)

            try:

                order = request.json

                order_id = order["id"]

                span.set_attribute("order.id", order_id)
                span.set_attribute("order.priority", order.get("priority", ""))
                span.set_attribute("order.location", order.get("location", ""))

                d.save_state(
                    store_name="orders",
                    key=order_id,
                    value=json.dumps(order)
                )

                app.logger.info("Order saved")

                return jsonify(order), 200

            except Exception as ex:

                span.record_exception(ex)

                app.logger.exception(ex)

                return str(ex), 500

            finally:

                app.logger.info("Completed POST order")


# ----------------------------------------------------
# DELETE ORDER
# ----------------------------------------------------
@app.route("/order", methods=["DELETE"])
def delete_order():

    app.logger.info("Delete order request")

    with tracer.start_as_current_span("Delete Order") as span:

        with DaprClient() as d:

            d.wait(5)

            try:

                order_id = request.args.get("id")

                if not order_id:

                    return jsonify('Order "id" not found'), 400

                span.set_attribute("order.id", order_id)

                d.delete_state(
                    store_name="orders",
                    key=order_id
                )

                app.logger.info("Order deleted")

                return f"Item {order_id} successfully deleted", 200

            except Exception as ex:

                span.record_exception(ex)

                app.logger.exception(ex)

                return str(ex), 500

            finally:

                app.logger.info("Completed DELETE order")


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000"))
    )
