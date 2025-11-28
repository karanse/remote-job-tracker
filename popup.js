// Load and display jobs
const loadJobs = () => {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || [];
    displayJobs(jobs);
    updateStats(jobs);
  });
};

const displayJobs = (jobs) => {
  const jobList = document.getElementById('job-list');

  if (jobs.length === 0) {
    jobList.innerHTML = `
      <div class="empty-state">
        <h3>No jobs saved yet</h3>
        <p>Visit any job posting and click the "💼 Save Job" button to start tracking!</p>
      </div>
    `;
    return;
  }

  jobList.innerHTML = jobs.map(job => `
    <div class="job-item">
      <div class="job-company">${escapeHtml(job.company)}</div>
      <div class="job-role">${escapeHtml(job.role)}</div>
      ${job.url ? `<a href="${escapeHtml(job.url)}" target="_blank" class="job-url">Open Job Posting →</a>` : ''}
      <div class="job-meta">
        <span>Saved: ${formatDate(job.savedDate)}</span>
        <button class="delete-btn" data-id="${job.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Add delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      deleteJob(id);
    });
  });
};

const deleteJob = (id) => {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || [];
    const filtered = jobs.filter(job => job.id !== id);
    chrome.storage.local.set({ jobs: filtered }, () => {
      loadJobs();
    });
  });
};

const updateStats = (jobs) => {
  const stats = document.getElementById('stats');
  const companies = new Set(jobs.map(j => j.company)).size;
  stats.textContent = `Total: ${jobs.length} jobs from ${companies} companies`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Export to CSV
document.getElementById('export-btn').addEventListener('click', () => {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || [];

    if (jobs.length === 0) {
      alert('No jobs to export');
      return;
    }

    const csv = [
      ['Company', 'Role', 'URL', 'Source', 'Saved Date'].join(','),
      ...jobs.map(job => [
        `"${job.company}"`,
        `"${job.role}"`,
        `"${job.url || ''}"`,
        `"${job.source || ''}"`,
        `"${new Date(job.savedDate).toLocaleString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remote-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

// Initialize
loadJobs();
