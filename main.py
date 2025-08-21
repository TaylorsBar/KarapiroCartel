from business_os.config import get_config
from business_os.business_os import BusinessOS


def run():
    cfg = get_config()
    bos = BusinessOS(cfg)
    interval = int(cfg.get("scan_interval_seconds", 300))
    while True:
        problems = bos.detect_issues()
        for problem in problems:
            result = bos.solve_problem(problem)
            if result.requires_human_review:
                print(f"Human review needed for: {problem.description}")
        import time
        time.sleep(interval)


if __name__ == "__main__":
    run()