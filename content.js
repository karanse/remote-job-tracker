// Log to confirm script is running
console.log('Remote Job Tracker: Content script loaded');

// Create floating save button
const createSaveButton = () => {
  const btn = document.createElement('div');
  btn.id = 'job-tracker-btn';
  btn.innerHTML = '💼 Save Job';
  btn.title = 'Click to save this job opportunity';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    showSaveDialog();
  });
};

// Show dialog to capture job details
const showSaveDialog = () => {
  const dialog = document.createElement('div');
  dialog.id = 'job-tracker-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>Save Job Opportunity</h3>
      <input type="text" id="company-input" placeholder="Company Name" />
      <input type="text" id="role-input" placeholder="Job Role" />
      <input type="text" id="url-input" placeholder="Job URL (optional)" value="${window.location.href}" />
      <div class="dialog-buttons">
        <button id="save-btn">Save</button>
        <button id="cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById('company-input').focus();

  document.getElementById('save-btn').addEventListener('click', saveJob);
  document.getElementById('cancel-btn').addEventListener('click', () => {
    dialog.remove();
  });

  // Save on Enter key
  dialog.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveJob();
  });
};

const saveJob = () => {
  const company = document.getElementById('company-input').value.trim();
  const role = document.getElementById('role-input').value.trim();
  const url = document.getElementById('url-input').value.trim();

  if (!company || !role) {
    alert('Please enter both company name and role');
    return;
  }

  const job = {
    id: Date.now(),
    company,
    role,
    url,
    savedDate: new Date().toISOString(),
    source: window.location.hostname
  };

  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || [];
    jobs.unshift(job);
    chrome.storage.local.set({ jobs }, () => {
      showNotification('Job saved successfully!');
      document.getElementById('job-tracker-dialog').remove();
    });
  });
};

const showNotification = (message) => {
  const notif = document.createElement('div');
  notif.className = 'job-tracker-notification';
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add('show');
  }, 10);

  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 2000);
};

// Initialize
createSaveButton();
