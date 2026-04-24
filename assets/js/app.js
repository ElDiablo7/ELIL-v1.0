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
    console.log('Initializing ENLIL\u2122 TITAN\u2122 + SENTINEL\u2122 Security Console...');

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

    // Mode toggle handling
    const titanBtn = document.getElementById('mode-titan');
    if (titanBtn) {
      titanBtn.addEventListener('click', () => {
        window.open('titan.html', '_blank', 'width=1400,height=900,menubar=no,toolbar=no');
      });
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
        showThreatScan();
        break;
      case 'integrity':
        showIntegrity();
        break;
      case 'compliance':
        showCompliance();
        break;
      case 'decision-stress':
        showDecisionStress();
        break;
      case 'red-team':
        showRedTeam();
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
    const consoleEl = document.getElementById('output-console');
    if (!consoleEl) return;

    const health = Sentinel.healthCheck();
    const stats = Logs.getStats();

    consoleEl.innerHTML = `
      <!-- Status Badges Bar -->
      <div class="status-badges-bar">
        <span class="status-badge badge-demo">◉ Demo Mode Active</span>
        <span class="status-badge badge-local">◉ Local Audit Storage</span>
        <span class="status-badge badge-pending">◉ Backend Hardening Pending</span>
        <span class="status-badge badge-online">◉ TITAN™ Online</span>
        <span class="status-badge badge-active">◉ SENTINEL™ Governor Active</span>
      </div>

      <!-- OPERATOR GUIDE: START HERE -->
      <div class="output-card operator-guide-card">
        <div class="card-header">
          <span class="card-title">▶ START HERE — Operator Guide</span>
        </div>
        <div class="card-content">
          <div class="guide-section">
            <h4 class="guide-heading">What is ENLIL™?</h4>
            <p>ENLIL™ is a <strong>prototype security-governance console</strong> designed for audit-led operation and structured oversight workflows. It runs entirely in your browser — no backend required.</p>
          </div>

          <div class="guide-grid">
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--blue-glow)">🛡</div>
              <div>
                <strong>SENTINEL™</strong> — The Governor<br>
                <span class="guide-desc">Routes all commands, enforces policies, manages access control, handles lockdowns, and maintains the audit log chain.</span>
              </div>
            </div>
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--amber)">🧠</div>
              <div>
                <strong>TITAN™</strong> — The Analyst<br>
                <span class="guide-desc">Performs threat analysis, decision stress-testing, red team simulations, and deep behavioral assessment. Internal-only — invoked via SENTINEL.</span>
              </div>
            </div>
          </div>

          <div class="guide-section">
            <h4 class="guide-heading">What should I do first?</h4>
            <ol class="guide-steps">
              <li>Explore the <strong>tabs on the left</strong> — each opens a different module (Threat Scan, Compliance, Red Team, etc.)</li>
              <li>Click any <strong>Demo Command</strong> button below to see the system in action</li>
              <li>Or type a command directly into the <strong>command bar</strong> at the top</li>
              <li>Click the <strong>TITAN</strong> mode button (left panel) to open the TITAN™ Command Center</li>
              <li>Press <strong>[H]</strong> on your keyboard to open the full system help overlay</li>
            </ol>
          </div>

          <div class="guide-section">
            <h4 class="guide-heading">What do the Audit/Export buttons do?</h4>
            <p>Go to the <strong>Logs</strong> tab (left panel) to view, export, or audit-verify the full chain of actions taken during this session. All actions are recorded automatically.</p>
          </div>

          <div class="guide-section">
            <h4 class="guide-heading">Demo Mode vs Production</h4>
            <p><strong>Current status: DEMO MODE.</strong> All data is stored locally in your browser. Threat scans, compliance checks, and red team scenarios use built-in sample data. No external calls are made.</p>
            <p class="guide-note">Future production hardening will add: encrypted backend storage, real-time threat feeds, multi-operator sessions, and hardware key authentication.</p>
          </div>
        </div>
      </div>

      <!-- QUICK DEMO COMMANDS -->
      <div class="output-card" style="border-left: 4px solid var(--amber);">
        <div class="card-header">
          <span class="card-title">⚡ Quick Demo Commands — Click to Run</span>
        </div>
        <div class="card-content">
          <div class="demo-grid">
            <div class="demo-grid-section">
              <span class="demo-category">Security Scans</span>
              <button class="demo-btn-inline" onclick="App.runDemo('threat scan prompt injection')">🔍 Threat Scan: Prompt Injection</button>
              <button class="demo-btn-inline" onclick="App.runDemo('system integrity check')">🔐 System Integrity Check</button>
              <button class="demo-btn-inline" onclick="App.runDemo('compliance check data handling')">📋 Compliance Check: Data Handling</button>
            </div>
            <div class="demo-grid-section">
              <span class="demo-category">Advanced Analysis</span>
              <button class="demo-btn-inline" onclick="App.runDemo('decision stress test rollout plan')">🧪 Decision Stress Test: Rollout Plan</button>
              <button class="demo-btn-inline" onclick="App.runDemo('red team scenario 03')">🎯 Red Team Scenario #03</button>
            </div>
            <div class="demo-grid-section">
              <span class="demo-category">System Actions</span>
              <button class="demo-btn-inline" onclick="App.runDemo('export audit')">📦 Export Audit Logs</button>
              <button class="demo-btn-inline" onclick="window.open('titan.html','_blank','width=1400,height=900')">🖥 Open TITAN™ Dashboard</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SYSTEM STATUS -->
      <div class="output-card posture-${health.posture.toLowerCase()}">
        <div class="card-header">
          <span class="card-title">System Status: ${getPostureEmoji(health.posture)} ${health.posture}</span>
        </div>
        <div class="card-content">
          <p><strong>Sentinel Integrity:</strong> ${health.log_chain_verified ? 'VERIFIED' : 'FAILED'}</p>
          <p><strong>Titan Pulse:</strong> ${health.initialized ? 'ACTIVE' : 'OFFLINE'}</p>
          <p><strong>Policy Layer:</strong> ${health.policy_pack_loaded ? 'SECURE' : 'UNPROTECTED'}</p>
          <p><strong>Total Event Entries:</strong> ${stats.total_entries}</p>
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

  function showThreatScan() {
    const console = document.getElementById('output-console');
    if (!console) return;

    console.innerHTML = `
      <div class="output-card">
        <div class="card-header"><span class="card-title">Threat Scan Module</span></div>
        <div class="card-content">
          <p>Scan system inputs and external connections for malicious patterns, including prompt injections and taxonomy-defined threats.</p>
          <div style="margin-top: 15px;">
            <input type="text" id="threat-scan-input" class="command-input" placeholder="Target parameter or simulation payload..." style="width: 70%; margin-right: 10px;">
            <button id="run-threat-scan-btn" class="route-btn" style="display:inline-block;">Run Scan</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('run-threat-scan-btn')?.addEventListener('click', () => {
      const input = document.getElementById('threat-scan-input').value;
      const cmdInput = document.getElementById('command-input');
      if (cmdInput) {
        cmdInput.value = `threat scan ${input}`;
        handleRouteCommand();
      }
    });
  }

  function showIntegrity() {
    const console = document.getElementById('output-console');
    if (!console) return;

    console.innerHTML = `
      <div class="output-card">
        <div class="card-header"><span class="card-title">System Integrity Monitor</span></div>
        <div class="card-content">
          <p>Verify immutable log chains, check policy configuration drift, and assess supply chain dependencies.</p>
          <div style="margin-top: 15px;">
            <button id="run-integrity-btn" class="route-btn" style="display:inline-block;">Run Integrity Check</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('run-integrity-btn')?.addEventListener('click', () => {
      const cmdInput = document.getElementById('command-input');
      if (cmdInput) {
        cmdInput.value = 'system integrity check';
        handleRouteCommand();
      }
    });
  }

  function showCompliance() {
    const console = document.getElementById('output-console');
    if (!console) return;

    console.innerHTML = `
      <div class="output-card">
        <div class="card-header"><span class="card-title">Compliance Verification</span></div>
        <div class="card-content">
          <p>Evaluate actions against the active Policy Pack and scan for sensitive data handling violations.</p>
          <div style="margin-top: 15px;">
            <input type="text" id="compliance-input" class="command-input" placeholder="Enter action or data string to verify..." style="width: 70%; margin-right: 10px;">
            <button id="run-compliance-btn" class="route-btn" style="display:inline-block;">Verify Compliance</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('run-compliance-btn')?.addEventListener('click', () => {
      const input = document.getElementById('compliance-input').value;
      const cmdInput = document.getElementById('command-input');
      if (cmdInput) {
        cmdInput.value = `compliance check ${input}`;
        handleRouteCommand();
      }
    });
  }

  function showDecisionStress() {
    const console = document.getElementById('output-console');
    if (!console) return;

    console.innerHTML = `
      <div class="output-card">
        <div class="card-header"><span class="card-title">Decision Stress Test Engine</span></div>
        <div class="card-content">
          <p>Simulate failure modes, edge cases, and adversarial scenarios against a proposed operational plan.</p>
          <div style="margin-top: 15px;">
            <input type="text" id="stress-input" class="command-input" placeholder="Summarize plan to stress test..." style="width: 70%; margin-right: 10px;">
            <button id="run-stress-btn" class="route-btn" style="display:inline-block;">Initiate Stress Test</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('run-stress-btn')?.addEventListener('click', () => {
      const input = document.getElementById('stress-input').value;
      const cmdInput = document.getElementById('command-input');
      if (cmdInput) {
        cmdInput.value = `decision stress test ${input}`;
        handleRouteCommand();
      }
    });
  }

  function showRedTeam() {
    const console = document.getElementById('output-console');
    if (!console) return;

    console.innerHTML = `
      <div class="output-card">
        <div class="card-header"><span class="card-title">Red Team Simulations</span></div>
        <div class="card-content">
          <p>Execute advanced adversarial scenarios to map attack paths and test system countermeasures.</p>
          <div style="margin-top: 15px;">
            <select id="redteam-scenario-select" class="policy-select" style="width: 70%; margin-right: 10px;">
              <option value="auth_bypass">Authentication Bypass</option>
              <option value="data_exfil">Data Exfiltration</option>
              <option value="03" selected>Scenario #03 (Demo)</option>
            </select>
            <button id="run-redteam-btn" class="route-btn" style="display:inline-block;">Deploy Red Team</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('run-redteam-btn')?.addEventListener('click', () => {
      const input = document.getElementById('redteam-scenario-select').value;
      const cmdInput = document.getElementById('command-input');
      if (cmdInput) {
        cmdInput.value = `red team scenario ${input}`;
        handleRouteCommand();
      }
    });
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
      { text: '🔍 Threat Scan: prompt injection', command: 'threat scan prompt injection' },
      { text: '🔐 System Integrity Check', command: 'system integrity check' },
      { text: '📋 Compliance Check: data handling', command: 'compliance check data handling' },
      { text: '🧪 Stress Test: rollout plan', command: 'decision stress test rollout plan' },
      { text: '🎯 Red Team Scenario #03', command: 'red team scenario 03' },
      { text: '📦 Export Audit Logs', command: 'export audit' },
      { text: '🖥 Open TITAN™ Dashboard', command: 'open titan' }
    ];

    const demoContainer = document.getElementById('demo-commands');
    if (!demoContainer) return;

    // Add label
    const label = document.createElement('div');
    label.className = 'demo-commands-label';
    label.textContent = '⚡ QUICK COMMANDS';
    demoContainer.appendChild(label);

    demoCommands.forEach(({ text, command }) => {
      const btn = document.createElement('button');
      btn.className = 'demo-btn';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        if (command === 'open titan') {
          window.open('titan.html', '_blank', 'width=1400,height=900,menubar=no,toolbar=no');
          return;
        }
        if (command === 'export audit') {
          // Switch to logs tab and trigger export
          switchTab('logs');
          setTimeout(() => {
            const exportBtn = document.getElementById('export-logs-btn');
            if (exportBtn) exportBtn.click();
          }, 300);
          return;
        }
        const commandInput = document.getElementById('command-input');
        if (commandInput) {
          commandInput.value = command;
          handleRouteCommand();
        }
      });
      demoContainer.appendChild(btn);
    });
  }

  // Expose runDemo for inline onclick handlers in overview
  function runDemo(command) {
    if (command === 'export audit') {
      switchTab('logs');
      setTimeout(() => {
        const exportBtn = document.getElementById('export-logs-btn');
        if (exportBtn) exportBtn.click();
      }, 300);
      return;
    }
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
      commandInput.value = command;
      handleRouteCommand();
    }
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

  function getPostureEmoji(posture) {
    if (posture === 'BLACK') return '⚫';
    if (posture === 'RED') return '🔴';
    if (posture === 'AMBER') return '🟡';
    return '🟢';
  }

  function updatePostureIndicator(posture) {
    const indicator = document.getElementById('posture-indicator');
    if (indicator) {
      indicator.className = `posture-indicator posture-${posture.toLowerCase()}`;
      indicator.innerHTML = `<div class="posture-badge posture-${posture.toLowerCase()}">${getPostureEmoji(posture)} ${posture}</div>`;
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
