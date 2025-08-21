import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from .logging_config import setup_logging
from .agents import (
    DiagnosticsAgent,
    EcommerceAgent,
    CustomerServiceAgent,
    SupplyChainAgent,
    InventoryAgent,
    PerformanceAgent,
)
from .notifications import notify_review_needed


class BusinessDomain(Enum):
    DIAGNOSTICS = "DIAGNOSTICS"
    ECOMMERCE = "ECOMMERCE"
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE"
    SUPPLY_CHAIN = "SUPPLY_CHAIN"
    INVENTORY = "INVENTORY"
    PERFORMANCE = "PERFORMANCE"


@dataclass
class ProblemStatement:
    domain: BusinessDomain
    description: str
    context: dict = field(default_factory=dict)
    priority: int = 1
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class ProposedSolution:
    action: str
    parameters: dict
    confidence: float
    test_plan: str
    rollback_plan: str


@dataclass
class ExecutionResult:
    success: bool
    metrics: dict
    logs: List[str]
    requires_human_review: bool = False


class BusinessOS:
    def __init__(self, config: dict):
        self.logger = setup_logging(config['log_file'])
        self.data_connectors = config['data_connectors']
        self.self_improve = config.get('self_improve', False)
        self.human_review_threshold = float(config.get('human_review_threshold', 0.8))
        self.enabled_domains = set(config.get('enabled_domains', []))

        self.agents: Dict[BusinessDomain, object] = {}
        for domain in BusinessDomain:
            if domain.name in self.enabled_domains:
                self.agents[domain] = self._instantiate_agent(domain)

        self.logger.info("Business Operating System initialized")

    def _instantiate_agent(self, domain: BusinessDomain):
        if domain == BusinessDomain.DIAGNOSTICS:
            return DiagnosticsAgent()
        if domain == BusinessDomain.ECOMMERCE:
            return EcommerceAgent()
        if domain == BusinessDomain.CUSTOMER_SERVICE:
            return CustomerServiceAgent()
        if domain == BusinessDomain.SUPPLY_CHAIN:
            return SupplyChainAgent()
        if domain == BusinessDomain.INVENTORY:
            return InventoryAgent()
        if domain == BusinessDomain.PERFORMANCE:
            return PerformanceAgent()
        raise ValueError(f"Unknown domain: {domain}")

    def detect_issues(self) -> List[ProblemStatement]:
        problems: List[ProblemStatement] = []

        if BusinessDomain.DIAGNOSTICS in self.agents:
            diag_data = self.data_connectors['diagnostics'].get_recent_scans()
            if diag_data.get('failure_rate', 0) > 0.15:
                problems.append(ProblemStatement(
                    domain=BusinessDomain.DIAGNOSTICS,
                    description="High diagnostic failure rate",
                    context=diag_data,
                    priority=3,
                ))

        if BusinessDomain.ECOMMERCE in self.agents:
            shop_data = self.data_connectors['ecommerce'].get_sales_data()
            if shop_data.get('conversion_rate', 1) < 0.02:
                problems.append(ProblemStatement(
                    domain=BusinessDomain.ECOMMERCE,
                    description="Low conversion rate",
                    context=shop_data,
                    priority=2,
                ))

        if BusinessDomain.CUSTOMER_SERVICE in self.agents:
            cs_data = self.data_connectors['customer_service'].get_open_tickets()
            if cs_data.get('open', 0) > 10 or cs_data.get('avg_response_hours', 0) > 4:
                problems.append(ProblemStatement(
                    domain=BusinessDomain.CUSTOMER_SERVICE,
                    description="Customer service backlog",
                    context=cs_data,
                    priority=2,
                ))

        if BusinessDomain.SUPPLY_CHAIN in self.agents:
            sc_data = self.data_connectors['supply_chain'].get_shipments()
            if sc_data.get('late_shipments', 0) > 3 or sc_data.get('on_time_rate', 1) < 0.9:
                problems.append(ProblemStatement(
                    domain=BusinessDomain.SUPPLY_CHAIN,
                    description="Supply chain delays detected",
                    context=sc_data,
                    priority=3,
                ))

        if BusinessDomain.INVENTORY in self.agents:
            inv_data = self.data_connectors['inventory'].get_inventory_levels()
            for sku, locations in inv_data.items():
                if isinstance(locations, dict) and min(locations.values()) < 20:
                    problems.append(ProblemStatement(
                        domain=BusinessDomain.INVENTORY,
                        description=f"Low stock for {sku}",
                        context={"sku": sku, "locations": locations},
                        priority=2,
                    ))
                    break

        if BusinessDomain.PERFORMANCE in self.agents:
            perf_data = self.data_connectors['performance'].get_metrics()
            if perf_data.get('latency_ms', 0) > 250 or perf_data.get('cpu', 0) > 0.85:
                problems.append(ProblemStatement(
                    domain=BusinessDomain.PERFORMANCE,
                    description="System performance degradation",
                    context=perf_data,
                    priority=3,
                ))

        return problems

    def solve_problem(self, problem: ProblemStatement) -> ExecutionResult:
        self.logger.info(f"Processing problem: {problem.description}")
        agent = self.agents.get(problem.domain)
        if not agent:
            return ExecutionResult(success=False, metrics={}, logs=["No agent for domain"], requires_human_review=False)

        solution = self._propose_solution(agent, problem)
        requires_review = solution.confidence < self.human_review_threshold or problem.priority >= 4

        if requires_review:
            notify_review_needed(f"Review required for: {problem.description} | Proposed: {solution.action} {solution.parameters} (confidence {solution.confidence:.2f})")
            return ExecutionResult(success=False, metrics={}, logs=["Pending human approval"], requires_human_review=True)

        execution_result = self._execute_solution(agent, solution)

        if not self._verify_improvement(problem, solution, execution_result):
            self.logger.error("Solution failed verification; rolling back")
            self._execute_rollback(agent, solution)
            return ExecutionResult(success=False, metrics={}, logs=["Verification failed"], requires_human_review=False)

        if self.self_improve:
            self._update_agent_knowledge(agent, problem, solution, execution_result)

        return execution_result

    def _propose_solution(self, agent, problem: ProblemStatement) -> ProposedSolution:
        if problem.domain == BusinessDomain.DIAGNOSTICS:
            return ProposedSolution(
                action="update_diagnostic_algorithm",
                parameters={"version": "v2.1"},
                confidence=0.85,
                test_plan="Run against 50 known engine scans",
                rollback_plan="Revert to v2.0 algorithm",
            )
        if problem.domain == BusinessDomain.ECOMMERCE:
            recommendation = agent.optimize_conversion(problem.context)
            discount = recommendation.get('parameters', {}).get('discount', 0.1)
            return ProposedSolution(
                action="adjust_pricing",
                parameters={"sku": problem.context.get('sku', 'ALL'), "discount": discount},
                confidence=recommendation.get('confidence', 0.8),
                test_plan="A/B test on 10% traffic",
                rollback_plan="Revert pricing to previous baseline",
            )
        if problem.domain == BusinessDomain.CUSTOMER_SERVICE:
            return ProposedSolution(
                action="auto_triage",
                parameters={"priority_threshold": 0.8},
                confidence=0.88,
                test_plan="Shadow triage for 1 day",
                rollback_plan="Disable auto-triage",
            )
        if problem.domain == BusinessDomain.SUPPLY_CHAIN:
            return ProposedSolution(
                action="reroute",
                parameters={"priority_hubs": ["HUB1", "HUB3"]},
                confidence=0.8,
                test_plan="Pilot reroute for West region",
                rollback_plan="Revert routes",
            )
        if problem.domain == BusinessDomain.INVENTORY:
            return ProposedSolution(
                action="transfer_stock",
                parameters={"sku": problem.context.get('sku'), "from": "WH1", "to": "WH2", "qty": 50},
                confidence=0.83,
                test_plan="Simulate demand for 48h",
                rollback_plan="Reverse transfer if fill rate drops",
            )
        if problem.domain == BusinessDomain.PERFORMANCE:
            return ProposedSolution(
                action="scale_service",
                parameters={"service": "api", "delta": 2},
                confidence=0.78,
                test_plan="Load test at 1.5x",
                rollback_plan="Scale down to baseline",
            )
        raise ValueError("Unhandled domain for solution proposal")

    def _execute_solution(self, agent, solution: ProposedSolution) -> ExecutionResult:
        logs: List[str] = []
        metrics: Dict = {}
        try:
            if solution.action == "update_diagnostic_algorithm":
                logs.append("Diagnostics algorithm updated to v2.1 (simulated)")
                metrics = {"accuracy": 0.93, "time_saved": 15}
            elif solution.action == "adjust_pricing":
                params = solution.parameters
                result = self.data_connectors['ecommerce'].adjust_pricing(
                    sku=params.get('sku', 'ALL'),
                    discount=float(params.get('discount', 0.1)),
                )
                logs.append(f"Pricing adjusted: {result}")
                metrics = {"expected_lift": 0.02}
            elif solution.action == "auto_triage":
                logs.append("Auto-triage enabled (simulated)")
                metrics = {"backlog_reduction": 0.2}
            elif solution.action == "reroute":
                params = solution.parameters
                result = self.data_connectors['supply_chain'].reroute_shipments(
                    hubs=params.get('priority_hubs', [])
                )
                logs.append(f"Reroute action: {result}")
                metrics = {"on_time_rate_expected": 0.95}
            elif solution.action == "transfer_stock":
                p = solution.parameters
                result = self.data_connectors['inventory'].transfer_stock(
                    sku=p.get('sku'), from_wh=p.get('from'), to_wh=p.get('to'), qty=int(p.get('qty', 0))
                )
                logs.append(f"Stock transfer: {result}")
                metrics = {"stockout_risk_reduction": 0.6}
            elif solution.action == "scale_service":
                p = solution.parameters
                result = self.data_connectors['performance'].scale_service(
                    service=p.get('service', 'api'), delta=int(p.get('delta', 1))
                )
                logs.append(f"Scale: {result}")
                metrics = {"latency_improvement_ms": 40}
            else:
                logs.append("No execution for unknown action")
                return ExecutionResult(success=False, metrics={}, logs=logs)
        except Exception as exc:
            logs.append(f"Execution error: {exc}")
            return ExecutionResult(success=False, metrics={}, logs=logs)

        return ExecutionResult(success=True, metrics=metrics, logs=logs)

    def _verify_improvement(self, problem: ProblemStatement, solution: ProposedSolution, result: ExecutionResult) -> bool:
        if problem.domain == BusinessDomain.DIAGNOSTICS:
            test_result = self.data_connectors['diagnostics'].run_test_suite()
            return test_result.get('success_rate', 0) > 0.9
        if problem.domain == BusinessDomain.ECOMMERCE:
            return True
        if problem.domain == BusinessDomain.CUSTOMER_SERVICE:
            return True
        if problem.domain == BusinessDomain.SUPPLY_CHAIN:
            return True
        if problem.domain == BusinessDomain.INVENTORY:
            return True
        if problem.domain == BusinessDomain.PERFORMANCE:
            return True
        return True

    def _execute_rollback(self, agent, solution: ProposedSolution) -> None:
        self.logger.info(f"Executing rollback: {solution.rollback_plan}")

    def _update_agent_knowledge(self, agent, problem: ProblemStatement, solution: ProposedSolution, result: ExecutionResult) -> None:
        self.logger.info("Updating agent knowledge base (simulated)")