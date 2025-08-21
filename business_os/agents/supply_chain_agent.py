from typing import Dict


class SupplyChainAgent:
    def optimize_routes(self, shipments: Dict) -> Dict:
        return {"action": "reroute", "parameters": {"priority_hubs": ["HUB1", "HUB3"]}, "confidence": 0.8}