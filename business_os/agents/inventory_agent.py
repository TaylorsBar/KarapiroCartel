from typing import Dict


class InventoryAgent:
    def rebalance_stock(self, inventory: Dict) -> Dict:
        return {"action": "transfer_stock", "parameters": {"from": "WH1", "to": "WH2", "sku": "SKU123", "qty": 50}, "confidence": 0.83}