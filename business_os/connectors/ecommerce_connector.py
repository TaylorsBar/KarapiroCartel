from typing import Dict
from . import HttpConnectorBase


class EcommerceConnector(HttpConnectorBase):
    def get_sales_data(self) -> Dict:
        if self.base_url:
            try:
                return self._get("ecommerce/sales-summary")
            except Exception:
                pass
        return {"conversion_rate": 0.018, "revenue": 15200}

    def adjust_pricing(self, sku: str, discount: float) -> Dict:
        if self.base_url:
            try:
                return self._post("ecommerce/adjust-pricing", {"sku": sku, "discount": discount})
            except Exception:
                pass
        return {"status": "simulated", "sku": sku, "discount": discount}