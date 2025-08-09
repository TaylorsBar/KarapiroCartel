import os
import json
import logging
from typing import Optional

import requests


logger = logging.getLogger('BusinessOS')


def notify_review_needed(message: str) -> None:
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook:
        logger.warning("SLACK_WEBHOOK_URL not set; skipping Slack notification")
        return
    try:
        response = requests.post(webhook, data=json.dumps({"text": message}), headers={"Content-Type": "application/json"}, timeout=10)
        response.raise_for_status()
    except Exception as exc:
        logger.warning(f"Failed to send Slack notification: {exc}")