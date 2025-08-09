import os
import json
from typing import Any, Dict, Optional

import requests


class HttpConnectorBase:
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, timeout_seconds: int = 15):
        self.base_url = base_url.rstrip('/') if base_url else None
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.base_url:
            raise RuntimeError("Base URL not configured for connector")
        url = f"{self.base_url}/{path.lstrip('/')}"
        response = requests.get(url, headers=self._headers(), params=params, timeout=self.timeout_seconds)
        response.raise_for_status()
        return response.json()

    def _post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.base_url:
            raise RuntimeError("Base URL not configured for connector")
        url = f"{self.base_url}/{path.lstrip('/')}"
        response = requests.post(url, headers=self._headers(), data=json.dumps(payload), timeout=self.timeout_seconds)
        response.raise_for_status()
        return response.json()


from .diagnostics_connector import DiagnosticsConnector
from .ecommerce_connector import EcommerceConnector
from .customer_service_connector import CustomerServiceConnector
from .supply_chain_connector import SupplyChainConnector
from .inventory_connector import InventoryConnector
from .performance_connector import PerformanceConnector