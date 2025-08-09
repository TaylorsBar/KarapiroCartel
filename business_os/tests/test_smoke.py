from business_os.config import get_config
from business_os.business_os import BusinessOS


def test_detect_and_solve_smoke():
    cfg = get_config()
    bos = BusinessOS(cfg)
    problems = bos.detect_issues()
    assert isinstance(problems, list)
    for p in problems:
        result = bos.solve_problem(p)
        assert result is not None