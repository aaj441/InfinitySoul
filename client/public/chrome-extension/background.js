// WCAG Auditor Chrome Extension - Background Service Worker with Auto-Features

chrome.runtime.onInstalled.addListener(() => {
  console.log("WCAG Auditor extension installed!");
  
  // Create context menu
  chrome.contextMenus.create({
    id: "wcag-audit",
    title: "Audit Accessibility",
    contexts: ["page"],
  });
  
  // Initialize storage
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          autoAudit: false,
          autoShare: false,
          emailOnComplete: false,
          maxAudits: 10
        },
        audits: []
      });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "wcag-audit") {
    triggerAuditFromBackground(tab);
  }
});

// Handle audit results from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "AUDIT_COMPLETE") {
    const { data } = request;
    
    // Store audit result
    chrome.storage.local.get(["audits", "settings"], (result) => {
      const audits = result.audits || [];
      const settings = result.settings || {};
      
      const newAudit = {
        ...data,
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        tabId: sender.tab.id,
        tabTitle: sender.tab.title,
      };
      
      audits.unshift(newAudit);
      
      // Keep last N audits
      if (audits.length > settings.maxAudits) {
        audits.pop();
      }
      
      chrome.storage.local.set({ audits });
      
      // Auto-share if enabled
      if (settings.autoShare) {
        autoShareAudit(newAudit);
      }
      
      // Auto-email notification if enabled
      if (settings.emailOnComplete && data.score < 60) {
        sendNotification(newAudit);
      }
    });
  }
});

// Auto-trigger audits on specific URLs
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    
    if (settings.autoAudit) {
      const autoAuditPatterns = [
        'ecommerce',
        'healthcare',
        'government',
        'education',
        'financial'
      ];
      
      const shouldAudit = autoAuditPatterns.some(pattern => 
        details.url.toLowerCase().includes(pattern)
      );
      
      if (shouldAudit) {
        triggerAuditFromBackground({ id: details.tabId, url: details.url });
      }
    }
  });
});

function triggerAuditFromBackground(tab) {
  chrome.tabs.sendMessage(tab.id, { type: "RUN_AUDIT" }).catch(err => {
    console.log("Content script not available");
  });
}

function autoShareAudit(auditData) {
  // Send to dashboard API
  fetch('http://localhost:5000/api/extension/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      historyId: auditData.id,
      url: auditData.url,
      score: auditData.score,
      violations: auditData.violations,
      timestamp: auditData.timestamp
    })
  }).catch(err => console.error('Auto-share failed:', err));
}

function sendNotification(auditData) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/images/icon-128.png',
    title: 'WCAG Audit Alert',
    message: `Low accessibility score (${auditData.score}%) detected on ${auditData.url}`,
    priority: 2
  });
}
