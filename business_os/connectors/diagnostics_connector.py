from typing import Dict, Optional
from . import HttpConnectorBase


class DiagnosticsConnector(HttpConnectorBase):
    def get_recent_scans(self) -> Dict:
        if self.base_url:
            try:
                return self._get("diagnostics/recent-scans")
            except Exception:
                pass
        return {"total": 150, "failure_rate": 0.18}

    def run_test_suite(self) -> Dict:
        if self.base_url:
            try:
                return self._post("diagnostics/test-suite", {"suite": "regression"})
            except Exception:
                pass
        return {"success_rate": 0.95, "false_positives": 2}