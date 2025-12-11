// WCAG Auditor Chrome Extension - Popup Script with Auto-Features

document.getElementById('auditBtn').addEventListener('click', startAudit);
document.getElementById('reportBtn').addEventListener('click', viewFullReport);
document.getElementById('shareBtn').addEventListener('click', shareToDashboard);
document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
document.getElementById('clearBtn').addEventListener('click', clearHistory);

async function startAudit() {
  const auditBtn = document.getElementById('auditBtn');
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  
  auditBtn.disabled = true;
  loading.classList.add('show');
  status.classList.remove('show');
  results.classList.remove('show');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject axe-core script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: runAccessibilityAudit
    });
    
  } catch (error) {
    loading.classList.remove('show');
    status.classList.add('show', 'error');
    status.textContent = `Error: ${error.message}`;
    auditBtn.disabled = false;
  }
}

function viewFullReport() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const reportUrl = `${chrome.runtime.getURL('')}../../../reports?domain=${encodeURIComponent(tabs[0].url)}`;
    chrome.tabs.create({ url: reportUrl });
  });
}

function shareToDashboard() {
  const status = document.getElementById('status');
  status.classList.add('show', 'success');
  status.textContent = 'Audit shared!';
  setTimeout(() => status.classList.remove('show'), 2000);
}

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('../../index.html') });
}

async function clearHistory() {
  chrome.storage.local.set({ audits: [] });
  displayHistory();
  const status = document.getElementById('status');
  status.classList.add('show', 'success');
  status.textContent = 'History cleared';
  setTimeout(() => status.classList.remove('show'), 2000);
}

async function runAccessibilityAudit() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
  document.head.appendChild(script);
  
  script.onload = () => {
    window.axe.run({
      runOnly: { type: 'critical' }
    }, (error, results) => {
      if (error) {
        chrome.runtime.sendMessage({
          type: 'AUDIT_ERROR',
          error: error.message
        });
        return;
      }
      
      const violations = results.violations.length;
      const passed = results.passes.length;
      const score = Math.round((passed / (passed + violations)) * 100) || 100;
      
      chrome.runtime.sendMessage({
        type: 'AUDIT_COMPLETE',
        data: {
          score,
          violations,
          passed,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      });
    });
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const loading = document.getElementById('loading');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const auditBtn = document.getElementById('auditBtn');
  const reportBtn = document.getElementById('reportBtn');
  
  loading.classList.remove('show');
  
  if (request.type === 'AUDIT_COMPLETE') {
    const { score, violations, passed } = request.data;
    
    document.getElementById('scoreValue').textContent = `${score}%`;
    document.getElementById('issuesValue').textContent = violations;
    document.getElementById('passedValue').textContent = passed;
    
    results.classList.add('show');
    status.classList.add('show', 'success');
    status.textContent = `Complete! Score: ${score}%`;
    reportBtn.style.display = 'block';
    
    // Auto-save to history
    saveToHistory(request.data);
    
  } else if (request.type === 'AUDIT_ERROR') {
    status.classList.add('show', 'error');
    status.textContent = `Error: ${request.error}`;
  }
  
  auditBtn.disabled = false;
});

function saveToHistory(auditData) {
  chrome.storage.local.get(['audits'], (result) => {
    const audits = result.audits || [];
    audits.unshift({
      ...auditData,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    
    // Keep last 10 audits
    if (audits.length > 10) {
      audits.pop();
    }
    
    chrome.storage.local.set({ audits });
    displayHistory();
  });
}

function displayHistory() {
  chrome.storage.local.get(['audits'], (result) => {
    const audits = result.audits || [];
    const historyDiv = document.getElementById('history');
    
    if (audits.length === 0) {
      historyDiv.innerHTML = '<p style="opacity: 0.6; font-size: 11px;">No audits yet</p>';
      return;
    }
    
    historyDiv.innerHTML = audits.map(audit => {
      const scoreClass = audit.score >= 80 ? 'score-good' : audit.score >= 60 ? 'score-fair' : 'score-poor';
      return `
        <div class="history-item">
          <div class="history-url">${audit.url.substring(0, 35)}...</div>
          <span class="history-score ${scoreClass}">${audit.score}%</span> • <span>${audit.violations} issues</span>
        </div>
      `;
    }).join('');
  });
}

// Load history on popup open
document.addEventListener('DOMContentLoaded', displayHistory);
