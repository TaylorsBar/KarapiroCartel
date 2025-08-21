from typing import Dict


class CustomerServiceAgent:
    def handle_complaint(self, complaint: Dict) -> Dict:
        return {"resolution": "free_service", "follow_up": True, "confidence": 0.9}