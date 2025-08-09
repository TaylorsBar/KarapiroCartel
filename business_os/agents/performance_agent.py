from typing import Dict


class PerformanceAgent:
    def tune_system(self, metrics: Dict) -> Dict:
        return {"action": "increase_workers", "parameters": {"service": "api", "delta": 2}, "confidence": 0.78}