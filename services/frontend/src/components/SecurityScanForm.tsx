import { useState } from 'react';
import { api } from '../api/client';

interface SecurityScanFormProps {
  onScanStarted: (scanId: string) => void;
}

export default function SecurityScanForm({ onScanStarted }: SecurityScanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: 'demo-project',
    repositoryUrl: '',
    scannerType: 'dependency',
    branch: 'main',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scanId = `scan-${Date.now()}`;
      const response = await api.runSecurityScan({
        project_id: formData.projectId,
        scan_id: scanId,
        scanner_type: formData.scannerType,
        repository_url: formData.repositoryUrl,
        branch: formData.branch,
      });

      if (response.status === 'queued') {
        onScanStarted(scanId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start security scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="execution-form">
      <div className="form-group">
        <label htmlFor="repositoryUrl">Repository URL</label>
        <input
          id="repositoryUrl"
          type="text"
          placeholder="https://github.com/user/repo.git"
          value={formData.repositoryUrl}
          onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="scannerType">Scanner Type</label>
        <select
          id="scannerType"
          value={formData.scannerType}
          onChange={(e) => setFormData({ ...formData, scannerType: e.target.value })}
        >
          <option value="dependency">Dependency Vulnerabilities</option>
          <option value="sast">SAST (Static Analysis)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="branch">Branch</label>
        <input
          id="branch"
          type="text"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Starting...' : 'Run Security Scan'}
      </button>
    </form>
  );
}
