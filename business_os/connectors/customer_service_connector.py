from typing import Dict
from . import HttpConnectorBase


class CustomerServiceConnector(HttpConnectorBase):
    def get_open_tickets(self) -> Dict:
        if self.base_url:
            try:
                return self._get("cs/open-tickets")
            except Exception:
                pass
        return {"open": 7, "avg_response_hours": 3.2}

    def propose_resolution(self, ticket_id: str, resolution: str) -> Dict:
        if self.base_url:
            try:
                return self._post("cs/propose-resolution", {"ticket_id": ticket_id, "resolution": resolution})
            except Exception:
                pass
        return {"status": "simulated", "ticket_id": ticket_id}