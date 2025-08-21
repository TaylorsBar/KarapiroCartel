from typing import Dict
from . import HttpConnectorBase


class PerformanceConnector(HttpConnectorBase):
    def get_metrics(self) -> Dict:
        if self.base_url:
            try:
                return self._get("perf/metrics")
            except Exception:
                pass
        return {"cpu": 0.72, "latency_ms": 180}

    def scale_service(self, service: str, delta: int) -> Dict:
        if self.base_url:
            try:
                return self._post("perf/scale", {"service": service, "delta": delta})
            except Exception:
                pass
        return {"status": "simulated", "service": service, "delta": delta}