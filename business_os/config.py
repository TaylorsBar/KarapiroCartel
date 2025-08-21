import os
from typing import Dict, List

from .connectors import (
    DiagnosticsConnector,
    EcommerceConnector,
    CustomerServiceConnector,
    SupplyChainConnector,
    InventoryConnector,
    PerformanceConnector,
)


def _bool_env(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def _float_env(name: str, default: float) -> float:
    val = os.getenv(name)
    try:
        return float(val) if val is not None else default
    except Exception:
        return default


def _list_env(name: str, default: List[str]) -> List[str]:
    val = os.getenv(name)
    if not val:
        return default
    return [v.strip().upper() for v in val.split(',') if v.strip()]


def get_config() -> Dict:
    log_file = os.getenv("LOG_FILE", "/workspace/logs/business_os.log")
    enabled_domains = _list_env(
        "ENABLED_DOMAINS",
        ["DIAGNOSTICS", "ECOMMERCE", "CUSTOMER_SERVICE"],
    )

    config: Dict = {
        "log_file": log_file,
        "self_improve": _bool_env("SELF_IMPROVE", False),
        "human_review_threshold": _float_env("HUMAN_REVIEW_THRESHOLD", 0.8),
        "enabled_domains": enabled_domains,
        "scan_interval_seconds": int(os.getenv("SCAN_INTERVAL", "300")),
    }

    config["data_connectors"] = {
        "diagnostics": DiagnosticsConnector(
            base_url=os.getenv("DIAG_BASE_URL"),
            api_key=os.getenv("DIAG_API_KEY"),
        ),
        "ecommerce": EcommerceConnector(
            base_url=os.getenv("ECOMM_BASE_URL"),
            api_key=os.getenv("ECOMM_API_KEY"),
        ),
        "customer_service": CustomerServiceConnector(
            base_url=os.getenv("CS_BASE_URL"),
            api_key=os.getenv("CS_API_KEY"),
        ),
        "supply_chain": SupplyChainConnector(
            base_url=os.getenv("SUPPLY_BASE_URL"),
            api_key=os.getenv("SUPPLY_API_KEY"),
        ),
        "inventory": InventoryConnector(
            base_url=os.getenv("INV_BASE_URL"),
            api_key=os.getenv("INV_API_KEY"),
        ),
        "performance": PerformanceConnector(
            base_url=os.getenv("PERF_BASE_URL"),
            api_key=os.getenv("PERF_API_KEY"),
        ),
    }

    return config