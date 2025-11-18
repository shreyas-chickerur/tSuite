import { useState } from 'react';
import { api } from '../api/client';

interface TestExecutionFormProps {
  onTestStarted: (testRunId: string) => void;
}

export default function TestExecutionForm({ onTestStarted }: TestExecutionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: 'demo-project',
    repositoryUrl: '',
    framework: 'jest',
    branch: 'main',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const testRunId = `test-${Date.now()}`;
      const response = await api.executeTests({
        project_id: formData.projectId,
        test_run_id: testRunId,
        framework: formData.framework,
        repository_url: formData.repositoryUrl,
        branch: formData.branch,
      });

      if (response.status === 'queued') {
        onTestStarted(testRunId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test execution');
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
        <label htmlFor="framework">Test Framework</label>
        <select
          id="framework"
          value={formData.framework}
          onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
        >
          <option value="jest">Jest (JavaScript/TypeScript)</option>
          <option value="pytest">Pytest (Python)</option>
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
        {loading ? 'Starting...' : 'Run Tests'}
      </button>
    </form>
  );
}
