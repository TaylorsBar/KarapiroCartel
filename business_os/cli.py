import argparse
import time

from .config import get_config
from .business_os import BusinessOS, BusinessDomain, ProblemStatement


def run_detect() -> None:
    bos = BusinessOS(get_config())
    problems = bos.detect_issues()
    for p in problems:
        print(f"Detected: {p.domain.name} - {p.description} (priority {p.priority})")


def run_once() -> None:
    bos = BusinessOS(get_config())
    problems = bos.detect_issues()
    for p in problems:
        result = bos.solve_problem(p)
        print(f"Processed: {p.description} -> success={result.success}, review={result.requires_human_review}")


def run_daemon() -> None:
    cfg = get_config()
    bos = BusinessOS(cfg)
    interval = int(cfg.get("scan_interval_seconds", 300))
    while True:
        problems = bos.detect_issues()
        for p in problems:
            result = bos.solve_problem(p)
            if result.requires_human_review:
                print(f"Human review needed for: {p.description}")
        time.sleep(interval)


def solve_manual(domain: str, description: str, priority: int) -> None:
    bos = BusinessOS(get_config())
    problem = ProblemStatement(domain=BusinessDomain[domain.upper()], description=description, priority=priority)
    result = bos.solve_problem(problem)
    print(f"Manual solve: success={result.success}, review={result.requires_human_review}, logs={result.logs}")


def main():
    parser = argparse.ArgumentParser(description="BusinessOS CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("detect")
    sub.add_parser("run-once")
    sub.add_parser("run-daemon")

    sm = sub.add_parser("solve")
    sm.add_argument("domain", help="Domain name, e.g., DIAGNOSTICS")
    sm.add_argument("description", help="Problem description")
    sm.add_argument("--priority", type=int, default=2)

    args = parser.parse_args()

    if args.cmd == "detect":
        run_detect()
    elif args.cmd == "run-once":
        run_once()
    elif args.cmd == "run-daemon":
        run_daemon()
    elif args.cmd == "solve":
        solve_manual(args.domain, args.description, args.priority)


if __name__ == "__main__":
    main()