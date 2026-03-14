/**
 * Main Application Logic
 * UI orchestration, event handlers, tab navigation, command routing
 */

const App = (function () {
  'use strict';

  let currentTab = 'overview';
  let authenticated = false;

  // Initialize application
  async function init() {
    console.log('Initializing TITAN + SENTINEL Security Suite...');

    // Initialize modules in sequence to prevent race conditions
    try {
      await Policy.init();
      await Sentinel.init();
      await Titan.init();
      await Training.init();
      if (typeof GraceX_Voice !== 'undefined') GraceX_Voice.init();
      if (typeof Verification !== 'undefined') Verification.init();
    } catch (e) {
      console.error('Module initialization failed:', e);
    }

    // Setup UI
    setupSecurityModal();
    setupHelpOverlay();
    setupEventListeners();
    setupTabNavigation();
    setupDemoCommands();
    setupEventHandlers();

    // Update UI
    updateStatusPanel();
    updateLogsDisplay();

    // Skip security modal for bypass
    // showSecurityModal();
    authenticated = true;
    updateUI();
  }

  // Security Modal
  function setupSecurityModal() {
    const modal = document.getElementById('security-modal');
    const acknowledgeBtn = document.getElementById('modal-acknowledge');
    const exitBtn = document.getElementById('modal-exit');

    if (acknowledgeBtn) {
      acknowledgeBtn.addEventListener('click', () => {
        hideSecurityModal();
        // Prompt for authentication
        setTimeout(() => {
          promptAuthentication();
        }, 300); // Small delay for visual transition
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        // Try to close window
        window.close();
        // If that fails, show message
        alert('Access denied. Please close this browser tab.');
      });
    }
  }

  function showSecurityModal() {
    const modal = document.getElementById('security-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  function hideSecurityModal() {
    const modal = document.getElementById('security-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function promptAuthentication() {
    // Authentication bypassed in previous task
    updateStatusPanel();
    updateUI();
  }

  // Help Overlay
  function setupHelpOverlay() {
    const helpOverlay = document.getElementById('help-overlay');
    const helpTrigger = document.getElementById('help-trigger');
    const helpClose = document.getElementById('help-close');

    if (helpTrigger) {
      helpTrigger.addEventListener('click', toggleHelpOverlay);
    }

    if (helpClose) {
      helpClose.addEventListener('click', hideHelpOverlay);
    }

    // Toggle on 'H' key, close on 'ESC'
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
        toggleHelpOverlay();
      }
      if (e.key === 'Escape') {
        hideHelpOverlay();
        hideSecurityModal();
      }
    });

    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) hideHelpOverlay();
    });
  }

  function toggleHelpOverlay() {
    const helpOverlay = document.getElementById('help-overlay');
    if (helpOverlay) {
      const isVisible = helpOverlay.style.display === 'flex';
      helpOverlay.style.display = isVisible ? 'none' : 'flex';
    }
  }

  function hideHelpOverlay() {
    const helpOverlay = document.getElementById('help-overlay');
    if (helpOverlay) {
      helpOverlay.style.display = 'none';
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Command input
    const commandInput = document.getElementById('command-input');
    const routeBtn = document.getElementById('route-btn');

    if (commandInput) {
      commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleRouteCommand();
        }
      });
    }

    if (routeBtn) {
      routeBtn.addEventListener('click', handleRouteCommand);
    }

    // Lockdown switch
    const lockdownToggle = document.getElementById('lockdown-toggle');
    if (lockdownToggle) {
      lockdownToggle.addEventListener('click', handleLockdownToggle);
    }

    // Mode toggle (TITAN should be locked)
    const titanModeBtn = document.getElementById('mode-titan');
    if (titanModeBtn) {
      titanModeBtn.classList.add('locked');
      titanModeBtn.title = 'TITAN_INTERNAL_ONLY - Cannot be invoked directly';
    }

    // Event emitters
    Utils.EventEmitter.on('sentinel:posture_changed', (data) => {
      updateStatusPanel();
      updatePostureIndicator(data.level);
    });

    Utils.EventEmitter.on('sentinel:authenticated', (data) => {
      authenticated = true;
      updateUI();
    });

    Utils.EventEmitter.on('log:new', () => {
      updateLogsDisplay();
      updateStatusPanel();
    });
  }

  // Tab Navigation
  function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        switchTab(tabId);
      });
    });

    // Set default tab
    switchTab('overview');
  }

  function switchTab(tabId) {
    currentTab = tabId;

    // Update tab appearance
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
      }
    });

    // Show/hide tab content
    const outputConsole = document.getElementById('output-console');
    const tabContents = document.querySelectorAll('.tab-content');

    // Hide all tab-specific content areas
    tabContents.forEach(content => {
      content.style.display = 'none';
    });

    // Show output console for most tabs (it's the main display area)
    if (outputConsole) {
      if (tabId === 'logs') {
        // Hide main console, show logs tab
        outputConsole.style.display = 'none';
        const logsTab = document.getElementById('tab-logs');
        if (logsTab) {
          logsTab.style.display = 'block';
        }
      } else {
        // Show main console, hide logs tab
        outputConsole.style.display = 'flex';
        outputConsole.style.flexDirection = 'column';
        const logsTab = document.getElementById('tab-logs');
        if (logsTab) {
          logsTab.style.display = 'none';
        }
      }
    }

    // Load tab-specific content
    loadTabContent(tabId);
  }

  function loadTabContent(tabId) {
    const console = document.getElementById('output-console');
    if (!console) return;

    switch (tabId) {
      case 'overview':
        showOverview();
        break;
      case 'threat-scan':
        // Content loaded on demand
        break;
      case 'integrity':
        // Content loaded on demand
        break;
      case 'compliance':
        // Content loaded on demand
        break;
      case 'decision-stress':
        // Content loaded on demand
        break;
      case 'red-team':
        // Content loaded on demand
        break;
      case 'logs':
        updateLogsDisplay();
        break;
      case 'policy':
        showPolicyInfo();
        break;
      case 'training':
        Training.render();
        break;
    }
  }

  function showOverview() {
    const console = document.getElementById('output-console');
    if (!console) return;

    const health = Sentinel.healthCheck();
    const stats = Logs.getStats();

    console.innerHTML = `
      <div class="output-card" style="border-left: 4px solid var(--blue-glow);">
        <div class="card-header">
          <span class="card-title">System Overview: ELIL</span>
        </div>
        <div class="card-content">
          <p><strong>Enterprise Level Intelligence & Logistics (ELIL)</strong> is a high-governance security enforcement and tactical training suite operating on a Zero-Trust architecture.</p>
          <p>It functions through the synergy of dual AI engines:</p>
          <ul>
            <li><strong>SENTINEL (Active Defense):</strong> The shield. Manages perimeter defense, real-time posture shifts, policy enforcement (e.g., Two-Person Rule), and automated system lockdowns.</li>
            <li><strong>TITAN (Tactical Intelligence):</strong> The brain. Provides deep behavioral analysis, strategic decision stress-testing, and advanced red-team simulations.</li>
          </ul>
          <p>ELIL governs system access via strict cryptographically verified policies while continuously sharpening operator readiness against sophisticated, state-level threats.</p>
        </div>
      </div>

      <div class="output-card posture-${health.posture.toLowerCase()}">
        <div class="card-header">
          <span class="card-title">System Status: ${health.posture}</span>
        </div>
        <div class="card-content">
          <p><strong>Sentinel Integrity:</strong> ${health.log_chain_verified ? 'VERIFIED' : 'FAILED'}</p>
          <p><strong>Titan Pulse:</strong> ${health.initialized ? 'ACTIVE' : 'OFFLINE'}</p>
          <p><strong>Policy Layer:</strong> ${health.policy_pack_loaded ? 'SECURE' : 'UNPROTECTED'}</p>
        </div>
      </div>

      <div class="training-grid">
        <div class="training-card">
          <div class="training-card-header"><span class="training-type">SENTINEL</span></div>
          <div class="training-card-title">Active Defense</div>
          <div class="training-card-summary">Enforces Zero-Trust routing and real-time posture management with automated lockdown capabilities.</div>
        </div>
        <div class="training-card">
          <div class="training-card-header"><span class="training-type">TITAN</span></div>
          <div class="training-card-title">Tactical Analysis</div>
          <div class="training-card-summary">Deep behavioral analysis, red-team simulations, and decision stress-testing for complex environments.</div>
        </div>
        <div class="training-card">
          <div class="training-card-header"><span class="training-type">TRAINING</span></div>
          <div class="training-card-title">Operator Readiness</div>
          <div class="training-card-summary">Integrated tactical simulations and core security doctrine modules to sharpen defensive responses.</div>
        </div>
      </div>

      <div class="output-card" style="margin-top: 20px;">
        <div class="card-header"><span class="card-title">Operational Statistics</span></div>
        <div class="card-content">
          <p><strong>Total Event Entries:</strong> ${stats.total_entries}</p>
          <p><strong>Core Version:</strong> ${health.version || '1.0.0-PRO'}</p>
          <p><strong>Session State:</strong> ${health.authenticated ? 'AUTHENTICATED [ADMIN]' : 'RESTRICTED'}</p>
        </div>
      </div>
    `;
  }

  function showPolicyInfo() {
    const console = document.getElementById('output-console');
    if (!console) return;

    const currentPack = Policy.getCurrentPolicyPack();
    const availablePacks = Policy.getAvailablePolicyPacks();

    let html = '<div class="output-card"><div class="card-header"><span class="card-title">Policy & Permissions</span></div><div class="card-content">';

    if (currentPack) {
      html += `<p><strong>Current Policy Pack:</strong> ${currentPack.name}</p>`;
      html += `<p><strong>Description:</strong> ${currentPack.description}</p>`;
      html += `<p><strong>Two-Person Rule:</strong> ${currentPack.two_person_rule?.enabled ? 'Enabled' : 'Disabled'}</p>`;
    }

    html += '<h4>Available Policy Packs:</h4><ul>';
    availablePacks.forEach(pack => {
      html += `<li>${pack.display_name} ${pack.locked ? '(LOCKED)' : ''}</li>`;
    });
    html += '</ul></div></div>';

    console.innerHTML = html;
  }

  async function showTrainingIndex() {
    const console = document.getElementById('output-console');
    if (!console) return;

    try {
      const response = await fetch('./assets/data/training_index.json');
      const data = await response.json();

      let html = '<div class="output-card"><div class="card-header"><span class="card-title">Training Index</span></div><div class="card-content">';

      for (const [category, items] of Object.entries(data)) {
        html += `<h4>${category.replace(/_/g, ' ').toUpperCase()}</h4>`;
        items.forEach(item => {
          html += `<p><strong>${item.title}</strong> - ${item.summary}</p>`;
          html += `<small>Tags: ${item.tags.join(', ')}</small><br><br>`;
        });
      }

      html += '</div></div>';
      console.innerHTML = html;
    } catch (e) {
      console.innerHTML = '<div class="output-card"><div class="card-content">Failed to load training index</div></div>';
    }
  }

  // Command Routing
  function handleRouteCommand() {
    if (!authenticated) {
      alert('Authentication required');
      promptAuthentication();
      return;
    }

    const commandInput = document.getElementById('command-input');
    if (!commandInput) return;

    const command = commandInput.value.trim();
    if (!command) return;

    // Route via Sentinel
    const result = Sentinel.route(command, {});

    if (result.success) {
      addOutputCard({
        title: `Command Routed via ${result.routed_via}`,
        content: result.summary || result.response || 'Command processed',
        posture: result.posture || Sentinel.getCurrentPosture(),
        risk_score: result.risk_score,
        findings: result.findings
      });

      // Update posture if changed
      if (result.posture && result.posture !== Sentinel.getCurrentPosture()) {
        Sentinel.setPosture(result.posture);
      }
    } else {
      addOutputCard({
        title: 'Command Rejected',
        content: result.reason || 'Unknown error',
        posture: 'RED'
      });
    }

    // Clear input
    commandInput.value = '';
  }

  // Lockdown Toggle
  function handleLockdownToggle() {
    const toggle = document.getElementById('lockdown-toggle');
    if (!toggle) return;

    if (Sentinel.isLockdownActive()) {
      // Unlockdown
      const pin = prompt('Enter PIN to unlock:');
      if (pin) {
        const result = Sentinel.unlockdown(pin);
        if (result.success) {
          toggle.classList.remove('active');
          updateStatusPanel();
          updateUI();
          addOutputCard({
            title: 'Lockdown Deactivated',
            content: 'System unlocked',
            posture: 'GREEN'
          });
        }
      }
    } else {
      // Lockdown
      const reason = prompt('Enter lockdown reason:') || 'Emergency lockdown';
      const result = Sentinel.lockdown(reason);
      if (result.success) {
        toggle.classList.add('active');
        updateStatusPanel();
        updateUI();
        addOutputCard({
          title: 'LOCKDOWN ACTIVATED',
          content: reason,
          posture: 'BLACK'
        });
      }
    }
  }

  // Demo Commands
  function setupDemoCommands() {
    const demoCommands = [
      { text: 'Run Threat Scan: prompt injection indicators', command: 'threat scan prompt injection' },
      { text: 'System Integrity Check', command: 'system integrity check' },
      { text: 'Compliance Check: data handling', command: 'compliance check data handling' },
      { text: 'Decision Stress Test: rollout plan', command: 'decision stress test rollout plan' },
      { text: 'Run Red Team Scenario #03', command: 'red team scenario 03' },
      { text: 'Lockdown', command: 'lockdown emergency' }
    ];

    const demoContainer = document.getElementById('demo-commands');
    if (!demoContainer) return;

    demoCommands.forEach(({ text, command }) => {
      const btn = document.createElement('button');
      btn.className = 'demo-btn';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        const commandInput = document.getElementById('command-input');
        if (commandInput) {
          commandInput.value = command;
          handleRouteCommand();
        }
      });
      demoContainer.appendChild(btn);
    });
  }

  // Output Cards
  function addOutputCard(data) {
    const console = document.getElementById('output-console');
    if (!console) return;

    const card = document.createElement('div');
    card.className = `output-card posture-${(data.posture || 'GREEN').toLowerCase()}`;

    let content = `<div class="card-header">
      <span class="card-title">${data.title || 'Output'}</span>
      <span>${Utils.formatTimestamp()}</span>
    </div>
    <div class="card-content">`;

    if (data.content) {
      content += `<p>${escapeHtml(data.content)}</p>`;
    }

    if (data.risk_score !== undefined) {
      content += `<p><strong>Risk Score:</strong> ${data.risk_score}</p>`;
    }

    if (data.findings && Array.isArray(data.findings)) {
      content += `<p><strong>Findings:</strong> ${data.findings.length}</p>`;
      if (data.findings.length > 0) {
        content += '<ul>';
        data.findings.slice(0, 5).forEach(finding => {
          content += `<li>${escapeHtml(finding.type || finding.description || JSON.stringify(finding))}</li>`;
        });
        content += '</ul>';
      }
    }

    if (data.recommended_controls && Array.isArray(data.recommended_controls)) {
      content += `<p><strong>Recommended Controls:</strong></p><ul>`;
      data.recommended_controls.slice(0, 3).forEach(control => {
        content += `<li>${escapeHtml(control)}</li>`;
      });
      content += '</ul>';
    }

    content += '</div></div>';

    card.innerHTML = content;
    console.insertBefore(card, console.firstChild);

    // Auto-scroll to top
    console.scrollTop = 0;
  }

  // Status Panel Updates
  function updateStatusPanel() {
    const posture = Sentinel.getCurrentPosture();
    const role = Sentinel.getCurrentRole();
    const policyPack = Policy.getCurrentPolicyPack();
    const authenticated = Sentinel.isAuthenticated();
    const lockdownActive = Sentinel.isLockdownActive();
    const health = Sentinel.healthCheck();

    updatePostureIndicator(posture);

    // Update policy pack display
    const policyDisplay = document.getElementById('current-policy');
    if (policyDisplay) {
      policyDisplay.textContent = policyPack?.name || 'None';
    }

    // Update role display
    const roleDisplay = document.getElementById('current-role');
    if (roleDisplay) {
      roleDisplay.textContent = role;
    }

    // Update posture display
    const postureDisplay = document.getElementById('current-posture');
    if (postureDisplay) {
      postureDisplay.textContent = posture;
    }

    // Update auth status
    const authStatus = document.getElementById('auth-status');
    if (authStatus) {
      authStatus.textContent = authenticated ? 'Yes' : 'No';
    }

    // Update lockdown status
    const lockdownStatus = document.getElementById('lockdown-status');
    if (lockdownStatus) {
      lockdownStatus.textContent = lockdownActive ? 'Active' : 'Inactive';
    }

    // Update integrity flags
    const logChainStatus = document.getElementById('log-chain-status');
    if (logChainStatus) {
      logChainStatus.textContent = health.log_chain_verified ? 'Verified' : 'Failed';
    }

    const policyStatus = document.getElementById('policy-status');
    if (policyStatus) {
      policyStatus.textContent = health.policy_pack_loaded ? 'Loaded' : 'Not Loaded';
    }
  }

  function updatePostureIndicator(posture) {
    const indicator = document.getElementById('posture-indicator');
    if (indicator) {
      indicator.className = `posture-indicator posture-${posture.toLowerCase()}`;
      indicator.innerHTML = `<div class="posture-badge posture-${posture.toLowerCase()}">${posture}</div>`;
    }
  }

  function updateLogsDisplay() {
    const logsContainer = document.getElementById('recent-events');
    if (logsContainer) {
      Logs.renderRecent(logsContainer, 10);
    }

    // Also update logs tab if active
    if (currentTab === 'logs') {
      const logsTabContainer = document.getElementById('logs-tab-content');
      if (logsTabContainer) {
        Logs.renderRecent(logsTabContainer, 50);
      }
    }
  }

  function updateUI() {
    const routeBtn = document.getElementById('route-btn');
    if (routeBtn) {
      routeBtn.disabled = !authenticated || Sentinel.isLockdownActive();
    }

    const commandInput = document.getElementById('command-input');
    if (commandInput) {
      commandInput.disabled = !authenticated || Sentinel.isLockdownActive();
    }
  }

  // Event Handlers
  function setupEventHandlers() {
    // Export logs button
    const exportBtn = document.getElementById('export-logs-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Logs.export();
      });
    }

    // Audit export button
    const auditBtn = document.getElementById('audit-export-btn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => {
        Sentinel.auditExport();
      });
    }

    // Policy pack selector
    const policySelect = document.getElementById('policy-pack-select');
    if (policySelect) {
      const packs = Policy.getAvailablePolicyPacks();
      packs.forEach(pack => {
        const option = document.createElement('option');
        option.value = pack.name;
        option.textContent = pack.display_name + (pack.locked ? ' (LOCKED)' : '');
        option.disabled = pack.locked;
        policySelect.appendChild(option);
      });

      policySelect.addEventListener('change', (e) => {
        if (e.target.value) {
          Sentinel.loadPolicyPack(e.target.value);
          updateStatusPanel();
          addOutputCard({
            title: 'Policy Pack Changed',
            content: `Loaded policy pack: ${e.target.value}`,
            posture: Sentinel.getCurrentPosture()
          });
        }
      });
    }
  }

  // Utility
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  return {
    init,
    switchTab,
    addOutputCard,
    updateStatusPanel,
    updateLogsDisplay
  };
})();

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
