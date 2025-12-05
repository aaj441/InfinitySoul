// WCAGAI Embeddable Accessibility Badge Widget
(function() {
  const WIDGET_VERSION = "1.0.0";
  const API_BASE = "https://infinity8.com";

  function createWidget(container, domain) {
    const html = `
      <div style="
        all: initial;
        display: block;
        width: 100%;
        max-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        color: #1f2937;
        line-height: 1.5;
      ">
        <div style="
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          space-y: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
              Accessibility Score
            </span>
            <a href="https://infinity8.com" target="_blank" rel="noopener noreferrer" style="
              font-size: 11px;
              color: #2563eb;
              text-decoration: none;
              font-weight: 600;
            ">by WCAGAI</a>
          </div>

          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span id="wcagai-score" style="font-size: 32px; font-weight: bold; color: #2563eb;">--</span>
            <span style="color: #9ca3af; font-size: 12px;">/100</span>
          </div>

          <div style="
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 9999px;
            overflow: hidden;
            margin-bottom: 8px;
          ">
            <div id="wcagai-progress" style="
              height: 100%;
              background: #3b82f6;
              width: 0%;
              transition: width 0.3s ease;
            "></div>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
            Last scanned: <span id="wcagai-date" style="font-weight: 600;">--</span>
          </p>

          <button id="wcagai-btn" style="
            display: block;
            width: 100%;
            padding: 8px 12px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          ">
            View Full Report
          </button>

          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 8px;">
            Updated weekly • No personal data shared
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Set button click handler
    const btn = container.querySelector("#wcagai-btn");
    if (btn) {
      btn.addEventListener("click", function() {
        window.open(`${API_BASE}/scanner?url=${encodeURIComponent(domain)}`, "_blank");
      });
      btn.addEventListener("mouseover", function() {
        this.style.background = "#1d4ed8";
      });
      btn.addEventListener("mouseout", function() {
        this.style.background = "#2563eb";
      });
    }

    // Fetch score
    fetchScore(domain, container);
  }

  function fetchScore(domain, container) {
    // Try to fetch from API
    fetch(`${API_BASE}/api/widget/score/${encodeURIComponent(domain)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.score !== undefined) {
          const score = Math.round(data.score);
          const scoreEl = container.querySelector("#wcagai-score");
          const progressEl = container.querySelector("#wcagai-progress");
          const dateEl = container.querySelector("#wcagai-date");

          if (scoreEl) scoreEl.textContent = score;
          if (progressEl) {
            progressEl.style.width = score + "%";
            progressEl.style.background = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
          }
          if (dateEl) {
            const date = new Date(data.updatedAt || new Date());
            dateEl.textContent = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        }
      })
      .catch((e) => {
        console.warn("[WCAGAI Widget] Failed to fetch score:", e);
        // Show loading state
        const scoreEl = container.querySelector("#wcagai-score");
        if (scoreEl) scoreEl.textContent = "?";
      });
  }

  // Auto-initialize all widgets on page
  function initializeWidgets() {
    const scripts = document.querySelectorAll("script[data-wcagai-widget]");

    scripts.forEach((script) => {
      const domain = script.getAttribute("data-site") || window.location.hostname;
      const container = document.createElement("div");
      script.parentNode.insertBefore(container, script.nextSibling);

      createWidget(container, domain);
    });
  }

  // Initialize on load or immediately if DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWidgets);
  } else {
    initializeWidgets();
  }

  // Expose global API
  window.WCAGAI = {
    version: WIDGET_VERSION,
    createWidget: createWidget,
    refreshScore: fetchScore,
  };
})();
