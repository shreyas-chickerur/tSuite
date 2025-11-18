import subprocess
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path
import tempfile
import shutil

logger = logging.getLogger(__name__)


class TestRunner:
    """Base class for test runners"""
    
    def __init__(self, framework: str):
        self.framework = framework
        
    async def run_tests(
        self,
        repository_url: str,
        branch: str = "main",
        test_command: Optional[str] = None,
        environment_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Run tests and return results"""
        raise NotImplementedError


class JestRunner(TestRunner):
    """Jest test runner for JavaScript/TypeScript projects"""
    
    def __init__(self):
        super().__init__("jest")
    
    async def run_tests(
        self,
        repository_url: str,
        branch: str = "main",
        test_command: Optional[str] = None,
        environment_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Run Jest tests
        
        Steps:
        1. Clone repository
        2. Install dependencies (npm install)
        3. Run tests with coverage
        4. Parse results
        5. Clean up
        """
        temp_dir = None
        
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp(prefix="tsuite_test_")
            logger.info(f"Created temp directory: {temp_dir}")
            
            # Clone repository
            logger.info(f"Cloning {repository_url} (branch: {branch})")
            clone_result = subprocess.run(
                ["git", "clone", "-b", branch, "--depth", "1", repository_url, temp_dir],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if clone_result.returncode != 0:
                raise Exception(f"Git clone failed: {clone_result.stderr}")
            
            # Install dependencies
            logger.info("Installing dependencies...")
            install_result = subprocess.run(
                ["npm", "install"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            if install_result.returncode != 0:
                logger.warning(f"npm install had warnings: {install_result.stderr}")
            
            # Run tests
            test_cmd = test_command or "npm test -- --json --coverage"
            logger.info(f"Running tests: {test_cmd}")
            
            env = environment_vars or {}
            env["CI"] = "true"  # Run in CI mode
            
            test_result = subprocess.run(
                test_cmd.split(),
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=600,
                env={**subprocess.os.environ, **env}
            )
            
            # Parse Jest JSON output
            results = self._parse_jest_output(test_result.stdout, test_result.stderr)
            results["exit_code"] = test_result.returncode
            results["success"] = test_result.returncode == 0
            
            return results
            
        except subprocess.TimeoutExpired:
            logger.error("Test execution timed out")
            return {
                "success": False,
                "error": "Test execution timed out",
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0
            }
        except Exception as e:
            logger.error(f"Test execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0
            }
        finally:
            # Clean up
            if temp_dir and Path(temp_dir).exists():
                logger.info(f"Cleaning up temp directory: {temp_dir}")
                shutil.rmtree(temp_dir, ignore_errors=True)
    
    def _parse_jest_output(self, stdout: str, stderr: str) -> Dict[str, Any]:
        """Parse Jest JSON output"""
        try:
            # Try to parse JSON output
            if stdout.strip():
                data = json.loads(stdout)
                
                return {
                    "total_tests": data.get("numTotalTests", 0),
                    "passed": data.get("numPassedTests", 0),
                    "failed": data.get("numFailedTests", 0),
                    "skipped": data.get("numPendingTests", 0),
                    "duration": data.get("testResults", [{}])[0].get("perfStats", {}).get("runtime", 0) / 1000,
                    "test_results": data.get("testResults", []),
                    "coverage": data.get("coverageMap", {})
                }
        except json.JSONDecodeError:
            logger.warning("Could not parse Jest JSON output, using fallback parsing")
        
        # Fallback: parse text output
        lines = (stdout + stderr).split("\n")
        total = passed = failed = skipped = 0
        
        for line in lines:
            if "Tests:" in line:
                # Parse summary line
                parts = line.split(",")
                for part in parts:
                    if "passed" in part.lower():
                        passed = int(''.join(filter(str.isdigit, part)))
                    elif "failed" in part.lower():
                        failed = int(''.join(filter(str.isdigit, part)))
                    elif "skipped" in part.lower() or "pending" in part.lower():
                        skipped = int(''.join(filter(str.isdigit, part)))
                    elif "total" in part.lower():
                        total = int(''.join(filter(str.isdigit, part)))
        
        return {
            "total_tests": total or (passed + failed + skipped),
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "duration": 0,
            "test_results": [],
            "coverage": {}
        }


class PytestRunner(TestRunner):
    """Pytest test runner for Python projects"""
    
    def __init__(self):
        super().__init__("pytest")
    
    async def run_tests(
        self,
        repository_url: str,
        branch: str = "main",
        test_command: Optional[str] = None,
        environment_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Run pytest tests"""
        temp_dir = None
        
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp(prefix="tsuite_test_")
            logger.info(f"Created temp directory: {temp_dir}")
            
            # Clone repository
            logger.info(f"Cloning {repository_url} (branch: {branch})")
            clone_result = subprocess.run(
                ["git", "clone", "-b", branch, "--depth", "1", repository_url, temp_dir],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if clone_result.returncode != 0:
                raise Exception(f"Git clone failed: {clone_result.stderr}")
            
            # Install dependencies
            logger.info("Installing dependencies...")
            install_result = subprocess.run(
                ["pip", "install", "-r", "requirements.txt"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            # Run tests
            test_cmd = test_command or "pytest --json-report --json-report-file=report.json --cov"
            logger.info(f"Running tests: {test_cmd}")
            
            env = environment_vars or {}
            
            test_result = subprocess.run(
                test_cmd.split(),
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=600,
                env={**subprocess.os.environ, **env}
            )
            
            # Parse pytest output
            results = self._parse_pytest_output(temp_dir, test_result.stdout, test_result.stderr)
            results["exit_code"] = test_result.returncode
            results["success"] = test_result.returncode == 0
            
            return results
            
        except Exception as e:
            logger.error(f"Test execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0
            }
        finally:
            # Clean up
            if temp_dir and Path(temp_dir).exists():
                logger.info(f"Cleaning up temp directory: {temp_dir}")
                shutil.rmtree(temp_dir, ignore_errors=True)
    
    def _parse_pytest_output(self, temp_dir: str, stdout: str, stderr: str) -> Dict[str, Any]:
        """Parse pytest output"""
        # Try to read JSON report
        report_path = Path(temp_dir) / "report.json"
        if report_path.exists():
            try:
                with open(report_path) as f:
                    data = json.load(f)
                    summary = data.get("summary", {})
                    
                    return {
                        "total_tests": summary.get("total", 0),
                        "passed": summary.get("passed", 0),
                        "failed": summary.get("failed", 0),
                        "skipped": summary.get("skipped", 0),
                        "duration": data.get("duration", 0),
                        "test_results": data.get("tests", []),
                        "coverage": {}
                    }
            except Exception as e:
                logger.warning(f"Could not parse pytest JSON report: {e}")
        
        # Fallback parsing
        return {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "duration": 0,
            "test_results": [],
            "coverage": {}
        }


def get_test_runner(framework: str) -> TestRunner:
    """Factory function to get appropriate test runner"""
    runners = {
        "jest": JestRunner,
        "pytest": PytestRunner,
    }
    
    runner_class = runners.get(framework.lower())
    if not runner_class:
        raise ValueError(f"Unsupported test framework: {framework}")
    
    return runner_class()
