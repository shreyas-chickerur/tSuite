import subprocess
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import tempfile
import shutil

logger = logging.getLogger(__name__)


class SecurityScanner:
    """Base class for security scanners"""
    
    def __init__(self, scanner_type: str):
        self.scanner_type = scanner_type
    
    async def scan(self, repository_url: str, branch: str = "main") -> Dict[str, Any]:
        """Run security scan and return results"""
        raise NotImplementedError


class DependencyScanner(SecurityScanner):
    """Scan for vulnerable dependencies"""
    
    def __init__(self):
        super().__init__("dependency")
    
    async def scan(self, repository_url: str, branch: str = "main") -> Dict[str, Any]:
        """
        Scan dependencies for vulnerabilities
        Supports npm audit for JavaScript and safety for Python
        """
        temp_dir = None
        
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp(prefix="tsuite_security_")
            logger.info(f"Created temp directory for security scan: {temp_dir}")
            
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
            
            vulnerabilities = []
            
            # Check for package.json (Node.js project)
            if Path(temp_dir, "package.json").exists():
                logger.info("Detected Node.js project, running npm audit")
                npm_vulns = await self._scan_npm(temp_dir)
                vulnerabilities.extend(npm_vulns)
            
            # Check for requirements.txt (Python project)
            if Path(temp_dir, "requirements.txt").exists():
                logger.info("Detected Python project, running safety check")
                python_vulns = await self._scan_python(temp_dir)
                vulnerabilities.extend(python_vulns)
            
            # Categorize by severity
            critical = [v for v in vulnerabilities if v.get("severity") == "critical"]
            high = [v for v in vulnerabilities if v.get("severity") == "high"]
            medium = [v for v in vulnerabilities if v.get("severity") == "medium"]
            low = [v for v in vulnerabilities if v.get("severity") == "low"]
            
            return {
                "scanner": "dependency",
                "total_vulnerabilities": len(vulnerabilities),
                "critical": len(critical),
                "high": len(high),
                "medium": len(medium),
                "low": len(low),
                "vulnerabilities": vulnerabilities,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Security scan failed: {str(e)}")
            return {
                "scanner": "dependency",
                "success": False,
                "error": str(e),
                "total_vulnerabilities": 0
            }
        finally:
            # Clean up
            if temp_dir and Path(temp_dir).exists():
                logger.info(f"Cleaning up temp directory: {temp_dir}")
                shutil.rmtree(temp_dir, ignore_errors=True)
    
    async def _scan_npm(self, project_dir: str) -> List[Dict[str, Any]]:
        """Run npm audit"""
        try:
            # Install dependencies first
            subprocess.run(
                ["npm", "install", "--package-lock-only"],
                cwd=project_dir,
                capture_output=True,
                timeout=300
            )
            
            # Run npm audit
            result = subprocess.run(
                ["npm", "audit", "--json"],
                cwd=project_dir,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.stdout:
                data = json.loads(result.stdout)
                vulnerabilities = []
                
                # Parse npm audit output
                for vuln_id, vuln_data in data.get("vulnerabilities", {}).items():
                    vulnerabilities.append({
                        "package": vuln_data.get("name", vuln_id),
                        "severity": vuln_data.get("severity", "unknown"),
                        "title": vuln_data.get("title", ""),
                        "vulnerable_versions": vuln_data.get("range", ""),
                        "patched_versions": vuln_data.get("fixAvailable", {}).get("version", ""),
                        "cve": vuln_data.get("via", [{}])[0].get("cve", "") if isinstance(vuln_data.get("via"), list) else "",
                        "source": "npm"
                    })
                
                return vulnerabilities
        except Exception as e:
            logger.warning(f"npm audit failed: {str(e)}")
        
        return []
    
    async def _scan_python(self, project_dir: str) -> List[Dict[str, Any]]:
        """Run safety check for Python dependencies"""
        try:
            # Check if safety is installed
            subprocess.run(
                ["pip", "install", "safety"],
                capture_output=True,
                timeout=60
            )
            
            # Run safety check
            result = subprocess.run(
                ["safety", "check", "--json", "--file", "requirements.txt"],
                cwd=project_dir,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.stdout:
                data = json.loads(result.stdout)
                vulnerabilities = []
                
                for vuln in data:
                    vulnerabilities.append({
                        "package": vuln.get("package", ""),
                        "severity": self._map_python_severity(vuln.get("severity", "")),
                        "title": vuln.get("vulnerability", ""),
                        "vulnerable_versions": vuln.get("vulnerable_spec", ""),
                        "patched_versions": vuln.get("fixed_versions", ""),
                        "cve": vuln.get("cve", ""),
                        "source": "safety"
                    })
                
                return vulnerabilities
        except Exception as e:
            logger.warning(f"safety check failed: {str(e)}")
        
        return []
    
    def _map_python_severity(self, severity: str) -> str:
        """Map Python severity to standard levels"""
        severity_map = {
            "high": "high",
            "medium": "medium",
            "low": "low"
        }
        return severity_map.get(severity.lower(), "medium")


class SASTScanner(SecurityScanner):
    """Static Application Security Testing scanner"""
    
    def __init__(self):
        super().__init__("sast")
    
    async def scan(self, repository_url: str, branch: str = "main") -> Dict[str, Any]:
        """
        Run SAST scan using semgrep
        """
        temp_dir = None
        
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp(prefix="tsuite_sast_")
            logger.info(f"Created temp directory for SAST scan: {temp_dir}")
            
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
            
            # Install semgrep if not available
            try:
                subprocess.run(
                    ["pip", "install", "semgrep"],
                    capture_output=True,
                    timeout=60
                )
            except:
                pass
            
            # Run semgrep
            logger.info("Running semgrep SAST scan")
            result = subprocess.run(
                ["semgrep", "--config=auto", "--json", "."],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            findings = []
            if result.stdout:
                try:
                    data = json.loads(result.stdout)
                    for finding in data.get("results", []):
                        findings.append({
                            "rule_id": finding.get("check_id", ""),
                            "severity": finding.get("extra", {}).get("severity", "medium"),
                            "message": finding.get("extra", {}).get("message", ""),
                            "file": finding.get("path", ""),
                            "line": finding.get("start", {}).get("line", 0),
                            "category": finding.get("extra", {}).get("metadata", {}).get("category", "security"),
                            "source": "semgrep"
                        })
                except json.JSONDecodeError:
                    logger.warning("Could not parse semgrep output")
            
            # Categorize by severity
            critical = [f for f in findings if f.get("severity") == "ERROR"]
            high = [f for f in findings if f.get("severity") == "WARNING"]
            medium = [f for f in findings if f.get("severity") == "INFO"]
            
            return {
                "scanner": "sast",
                "total_findings": len(findings),
                "critical": len(critical),
                "high": len(high),
                "medium": len(medium),
                "low": 0,
                "findings": findings,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"SAST scan failed: {str(e)}")
            return {
                "scanner": "sast",
                "success": False,
                "error": str(e),
                "total_findings": 0
            }
        finally:
            # Clean up
            if temp_dir and Path(temp_dir).exists():
                logger.info(f"Cleaning up temp directory: {temp_dir}")
                shutil.rmtree(temp_dir, ignore_errors=True)


def get_security_scanner(scanner_type: str) -> SecurityScanner:
    """Factory function to get appropriate security scanner"""
    scanners = {
        "dependency": DependencyScanner,
        "sast": SASTScanner,
    }
    
    scanner_class = scanners.get(scanner_type.lower())
    if not scanner_class:
        raise ValueError(f"Unsupported scanner type: {scanner_type}")
    
    return scanner_class()
