from typing import Dict
from . import HttpConnectorBase


class SupplyChainConnector(HttpConnectorBase):
    def get_shipments(self) -> Dict:
        if self.base_url:
            try:
                return self._get("supply/shipments")
            except Exception:
                pass
        return {"late_shipments": 5, "on_time_rate": 0.92}

    def reroute_shipments(self, hubs: list) -> Dict:
        if self.base_url:
            try:
                return self._post("supply/reroute", {"hubs": hubs})
            except Exception:
                pass
        return {"status": "simulated", "hubs": hubs}