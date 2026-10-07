def get_order_status(order_id: str) -> dict:
    """
    Get the status of a customer order from order records.
    """

    orders = {
        "ORD1001": {
            "status": "Shipped",
            "estimated_delivery": "2 days"
        },
        "ORD1002": {
            "status": "Processing",
            "estimated_delivery": "3 to 5 days"
        },
        "ORD1003": {
            "status": "Delivered",
            "estimated_delivery": "Delivered"
        },
        "ORD1004": {
            "status": "Cancelled",
            "estimated_delivery": "Not applicable"
        }
    }

    order_id = order_id.strip().upper()

    if order_id in orders:
        return {
            "success": True,
            "order_id": order_id,
            "status": orders[order_id]["status"],
            "estimated_delivery": orders[order_id]["estimated_delivery"]
        }

    return {
        "success": False,
        "order_id": order_id,
        "message": "Order ID not found."
    }