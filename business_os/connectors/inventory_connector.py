from typing import Dict
from . import HttpConnectorBase


class InventoryConnector(HttpConnectorBase):
    def get_inventory_levels(self) -> Dict:
        if self.base_url:
            try:
                return self._get("inventory/levels")
            except Exception:
                pass
        return {"SKU123": {"WH1": 200, "WH2": 10}}

    def transfer_stock(self, sku: str, from_wh: str, to_wh: str, qty: int) -> Dict:
        if self.base_url:
            try:
                return self._post("inventory/transfer", {"sku": sku, "from": from_wh, "to": to_wh, "qty": qty})
            except Exception:
                pass
        return {"status": "simulated", "sku": sku, "from": from_wh, "to": to_wh, "qty": qty}