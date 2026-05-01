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

    // Initialize modules in sequence with defensive guards
    const moduleStatus = {};
    const modules = [
      { name: 'Policy', fn: () => typeof Policy !== 'undefined' && Policy.init() },
      { name: 'Sentinel', fn: () => typeof Sentinel !== 'undefined' && Sentinel.init() },
      { name: 'Titan', fn: () => typeof Titan !== 'undefined' && Titan.init() },
      { name: 'Training', fn: () => typeof Training !== 'undefined' && Training.init() },
      { name: 'GraceX_Voice', fn: () => typeof GraceX_Voice !== 'undefined' && GraceX_Voice.init() },
      { name: 'Verification', fn: () => typeof Verification !== 'undefined' && Verification.init() }
    ];

    for (const mod of modules) {
      try {
        await mod.fn();
        moduleStatus[mod.name] = 'OK';
      } catch (e) {
        console.error(`Module ${mod.name} initialization failed:`, e);
        moduleStatus[mod.name] = 'FAILED';
        // Log to audit if Logs is available
        if (typeof Logs !== 'undefined') {
          Logs.append({
            actor_role: 'SYSTEM',
            action: 'MODULE_INIT_FAILED',
            posture: 'AMBER',
            payload: { module: mod.name, error: e.message },
            classification: 'INTERNAL'
          });
        }
      }
    }

    // Setup UI
    setupSecurityModal();
    setupHelpOverlay();
    setupEventListeners();
    setupTabNavigation();
    setupDemoCommands();
    setupEventHandlers();
    setupErrorOverlay();

    // Update UI
    updateStatusPanel();
    updateLogsDisplay();

    // Determine auth mode from config
    const isDemoMode = await getDemoMode();
    if (isDemoMode) {
      // DEMO MODE: auto-authenticate, no modal
      authenticated = true;
      updateUI();
      console.log('ENLIL\u2122 running in DEMO MODE — auto-authenticated.');
    } else {
      // PRODUCTION MODE: show security modal, require auth
      showSecurityModal();
    }

    // Log boot event
    if (typeof Logs !== 'undefined') {
      Logs.append({
        actor_role: 'SYSTEM',
        action: 'APP_BOOT',
        posture: 'GREEN',
        payload: { modules: moduleStatus, mode: isDemoMode ? 'demo-local' : 'production', demo_mode: isDemoMode },
        classification: 'INTERNAL'
      });
    }

    console.log('ENLIL\u2122 initialized. Module status:', moduleStatus);
  }

  // Config helper: check if DEMO_MODE is enabled
  async function getDemoMode() {
    try {
      const response = await fetch('./assets/data/config.default.json');
      if (response.ok) {
        const cfg = await response.json();
        return cfg?.system?.DEMO_MODE !== false; // Default to true if missing
      }
    } catch (e) {
      // file:// protocol or fetch failure — default to demo mode
    }
    return true; // Safe default: demo mode
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
    }// New Mode Buttons (Enabled)
    const modulePages = {
      guardian: 'guardian.html',
      forge: 'forge.html',
      venus: 'venus.html',
      laser: 'laser.html',
      titan: 'titan.html'
    };
    Object.entries(modulePages).forEach(([id, page]) => {
      const btn = document.getElementById(`mode-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          window.open(page, '_blank', 'width=1400,height=900,menubar=no,toolbar=no');
        });
      }
    });

    // Mobile nav toggle
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const leftPanel = document.querySelector('.left-panel');
    if (mobileNavToggle && leftPanel) {
      mobileNavToggle.addEventListener('click', () => {
        leftPanel.classList.toggle('mobile-open');
        mobileNavToggle.textContent = leftPanel.classList.contains('mobile-open') ? '✕' : '☰';
      });
      // Close nav when clicking a tab on mobile
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            leftPanel.classList.remove('mobile-open');
            mobileNavToggle.textContent = '☰';
          }
        });
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

    // Elements to manage
    const outputConsole = document.getElementById('output-console');
    const logsTab = document.getElementById('tab-logs');
    const demoCommands = document.getElementById('demo-commands');
    const lockdownSwitch = document.querySelector('.lockdown-switch');
    const commandHelper = document.querySelector('.command-helper-text');

    // Hide all tab-specific content areas first
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });

    if (tabId === 'logs') {
      // Logs tab: hide main console/demo area, show logs tab
      if (outputConsole) outputConsole.style.display = 'none';
      if (demoCommands) demoCommands.style.display = 'none';
      if (lockdownSwitch) lockdownSwitch.style.display = 'none';
      if (commandHelper) commandHelper.style.display = 'none';
      if (logsTab) {
        logsTab.style.display = 'block';
        logsTab.classList.remove('hidden');
      }
    } else {
      // All other tabs: show main console and surrounding elements
      if (outputConsole) {
        outputConsole.style.display = 'flex';
        outputConsole.style.flexDirection = 'column';
      }
      if (demoCommands) demoCommands.style.display = '';
      if (lockdownSwitch) lockdownSwitch.style.display = '';
      if (commandHelper) commandHelper.style.display = '';
      if (logsTab) logsTab.style.display = 'none';
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
                <span class="guide-desc">Governance overlay. Enforces policy, manages access, and maintains the immutable audit log chain.</span>
              </div>
            </div>
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--amber)">🧠</div>
              <div>
                <strong>TITAN™</strong> — The Nucleus<br>
                <span class="guide-desc">Tactical analysis engine. Performs deep behavioral assessment and adversarial reasoning.</span>
              </div>
            </div>
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--green)">🔒</div>
              <div>
                <strong>GUARDIAN™</strong> — The Shield<br>
                <span class="guide-desc">Defensive perimeter oversight and vulnerability shielding for core logic.</span>
              </div>
            </div>
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--silver)">⚒</div>
              <div>
                <strong>FORGE™</strong> — The Smith<br>
                <span class="guide-desc">Logic synthesis and core structural integrity for autonomous operations.</span>
              </div>
            </div>
            <div class="guide-item">
              <div class="guide-item-icon" style="color: var(--blue-bright)">🛰</div>
              <div>
                <strong>VENUS™</strong> — The Scout<br>
                <span class="guide-desc">External intelligence gathering and reconnaissance of foreign instruction vectors.</span>
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

    // Handle special commands first
    const cmdLower = command.toLowerCase();
    if (cmdLower === 'export audit' || cmdLower === 'export logs') {
      switchTab('logs');
      setTimeout(() => {
        const exportBtn = document.getElementById('export-logs-btn');
        if (exportBtn) exportBtn.click();
      }, 300);
      commandInput.value = '';
      return;
    }
    if (cmdLower === 'open titan' || cmdLower === 'titan') {
      window.open('titan.html', '_blank', 'width=1400,height=900,menubar=no,toolbar=no');
      commandInput.value = '';
      return;
    }
    if (cmdLower === 'help') {
      toggleHelpOverlay();
      commandInput.value = '';
      return;
    }

    // Route via Sentinel
    try {
      const result = Sentinel.route(command, {});

      if (result.success) {
        // Handle TITAN results (summary is an object from summarizeForOperator)
        let displayContent = '';
        let findings = result.findings || [];
        let recommendedControls = result.recommended_controls || [];

        if (result.summary && typeof result.summary === 'object') {
          displayContent = result.summary.summary || 'Analysis complete';
          findings = result.summary.findings || findings;
          recommendedControls = result.summary.recommended_controls || recommendedControls;
          if (result.summary.posture) {
            Sentinel.setPosture(result.summary.posture);
          }
        } else {
          displayContent = result.summary || result.response || 'Command processed';
        }

        addOutputCard({
          title: `Command Routed via ${result.routed_via}`,
          content: displayContent,
          posture: result.posture || Sentinel.getCurrentPosture(),
          risk_score: result.risk_score,
          findings: findings,
          recommended_controls: recommendedControls
        });
      } else {
        addOutputCard({
          title: 'Command Rejected',
          content: result.reason || 'Unknown error',
          posture: 'RED'
        });
      }
    } catch (e) {
      console.error('Command routing error:', e);
      addOutputCard({
        title: 'Routing Error',
        content: `An error occurred while processing: ${e.message}. The system remains operational.`,
        posture: 'AMBER'
      });
      if (typeof Logs !== 'undefined') {
        Logs.append({
          actor_role: 'SYSTEM',
          action: 'COMMAND_ERROR',
          posture: 'AMBER',
          payload: { command: command.substring(0, 50), error: e.message },
          classification: 'INTERNAL'
        });
      }
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

    // Also update logs tab if active, with filter support
    if (currentTab === 'logs') {
      const logsTabContainer = document.getElementById('logs-tab-content');
      if (logsTabContainer) {
        const filterModule = document.getElementById('audit-filter-module');
        const filterValue = filterModule ? filterModule.value : '';
        
        if (filterValue) {
          // Filtered view
          const filtered = Logs.getFiltered({ actor_role: filterValue });
          logsTabContainer.innerHTML = '';
          if (filtered.length === 0) {
            logsTabContainer.innerHTML = '<div class="log-entry empty">No entries for this filter</div>';
          } else {
            filtered.reverse().forEach(entry => {
              const logEl = document.createElement('div');
              logEl.className = `log-entry posture-${entry.posture.toLowerCase()}`;
              const timeStr = Utils.formatTimestamp(entry.timestamp);
              const timeAgo = Utils.formatTimeAgo(entry.timestamp);
              logEl.innerHTML = `
                <div class="log-header">
                  <span class="log-time" title="${timeStr}">${timeAgo}</span>
                  <span class="log-role">${entry.actor_role}</span>
                  <span class="log-posture posture-badge posture-${entry.posture.toLowerCase()}">${entry.posture}</span>
                </div>
                <div class="log-action">${escapeHtml(entry.action)}</div>
                <div class="log-policy">Policy: ${entry.policy_pack}</div>
                <div class="log-hash" title="Hash: ${entry.hash_current}">${entry.hash_current.substring(0, 8)}...</div>
              `;
              logsTabContainer.appendChild(logEl);
            });
          }
        } else {
          Logs.renderRecent(logsTabContainer, 50);
        }
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
    // Export logs button (JSON)
    const exportBtn = document.getElementById('export-logs-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Logs.export();
        addOutputCard({ title: 'Audit Export', content: 'JSON audit log exported successfully.', posture: 'GREEN' });
      });
    }

    // Export logs button (TXT)
    const exportTxtBtn = document.getElementById('export-logs-txt-btn');
    if (exportTxtBtn) {
      exportTxtBtn.addEventListener('click', () => {
        exportLogsTxt();
      });
    }

    // Audit export button (full snapshot)
    const auditBtn = document.getElementById('audit-export-btn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => {
        try {
          Sentinel.auditExport();
          addOutputCard({ title: 'Full Audit Export', content: 'Audit log + config snapshot exported.', posture: 'GREEN' });
        } catch (e) {
          addOutputCard({ title: 'Audit Export Failed', content: e.message, posture: 'RED' });
        }
      });
    }

    // Clear logs button
    const clearBtn = document.getElementById('clear-logs-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all audit logs? This action cannot be undone in demo mode.')) {
          Logs.clear();
          Logs.append({
            actor_role: 'OPERATOR',
            action: 'LOGS_CLEARED',
            posture: 'GREEN',
            payload: { mode: 'demo-local' },
            classification: 'INTERNAL'
          });
          updateLogsDisplay();
          addOutputCard({ title: 'Logs Cleared', content: 'Audit log chain has been reset.', posture: 'AMBER' });
        }
      });
    }

    // Audit filter by module
    const auditFilter = document.getElementById('audit-filter-module');
    if (auditFilter) {
      auditFilter.addEventListener('change', () => {
        updateLogsDisplay();
      });
    }

    // Policy pack selector
    const policySelect = document.getElementById('policy-pack-select');
    if (policySelect) {
      try {
        const packs = Policy.getAvailablePolicyPacks();
        packs.forEach(pack => {
          const option = document.createElement('option');
          option.value = pack.name;
          option.textContent = pack.display_name + (pack.locked ? ' (LOCKED)' : '');
          option.disabled = pack.locked;
          policySelect.appendChild(option);
        });
      } catch (e) {
        console.warn('Policy packs failed to load for selector:', e.message);
      }

      policySelect.addEventListener('change', (e) => {
        if (e.target.value) {
          try {
            Sentinel.loadPolicyPack(e.target.value);
            updateStatusPanel();
            addOutputCard({
              title: 'Policy Pack Changed',
              content: `Loaded policy pack: ${e.target.value}`,
              posture: Sentinel.getCurrentPosture()
            });
          } catch (err) {
            addOutputCard({ title: 'Policy Load Failed', content: err.message, posture: 'RED' });
          }
        }
      });
    }
  }

  // TXT Export (Phase 4)
  function exportLogsTxt() {
    const logs = Logs.getAll();
    let txt = '=== ENLIL™ AUDIT LOG EXPORT ===\n';
    txt += `Generated: ${new Date().toISOString()}\n`;
    txt += `Total Entries: ${logs.length}\n`;
    txt += `Storage: Browser localStorage (demo mode)\n`;
    txt += `Chain Verified: ${Logs.verify() ? 'YES' : 'NO'}\n`;
    txt += '================================\n\n';

    logs.forEach((entry, i) => {
      txt += `[${i + 1}] ${new Date(entry.timestamp).toISOString()}\n`;
      txt += `    Actor: ${entry.actor_role} | Action: ${entry.action}\n`;
      txt += `    Posture: ${entry.posture} | Policy: ${entry.policy_pack}\n`;
      txt += `    Classification: ${entry.classification}\n`;
      if (Object.keys(entry.payload_summary).length > 0) {
        txt += `    Payload: ${JSON.stringify(entry.payload_summary)}\n`;
      }
      txt += `    Hash: ${entry.hash_current}\n\n`;
    });

    txt += '=== END OF AUDIT LOG ===\n';
    txt += 'NOTE: This is a demo-mode export. Hash chain provides integrity indication only.\n';
    txt += 'Full cryptographic signing planned for production backend.\n';

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enlil_audit_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Logs.append({
      actor_role: 'OPERATOR',
      action: 'AUDIT_EXPORT_TXT',
      posture: 'GREEN',
      payload: { entry_count: logs.length, format: 'TXT' },
      classification: 'INTERNAL'
    });

    addOutputCard({ title: 'TXT Export', content: `Exported ${logs.length} audit entries as TXT.`, posture: 'GREEN' });
  }

  // Utility
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Error Overlay System (Phase 3)
  function setupErrorOverlay() {
    // Catch unhandled errors and show user-friendly overlay
    window.addEventListener('error', (e) => {
      console.error('Unhandled error:', e.error);
      showErrorOverlay(e.message, e.filename);
      if (typeof Logs !== 'undefined') {
        Logs.append({
          actor_role: 'SYSTEM',
          action: 'UNHANDLED_ERROR',
          posture: Sentinel?.getCurrentPosture?.() || 'AMBER',
          payload: { message: e.message, file: e.filename },
          classification: 'INTERNAL'
        });
      }
    });
  }

  function showErrorOverlay(message, source) {
    // Only show for real errors, not warnings
    if (!message) return;
    let overlay = document.getElementById('error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'error-overlay';
      overlay.className = 'error-overlay';
      overlay.innerHTML = `
        <div class="error-overlay-content">
          <div class="error-overlay-header">
            <span>⚠ System Notice</span>
            <button class="error-overlay-close" onclick="document.getElementById('error-overlay').style.display='none'">DISMISS</button>
          </div>
          <div class="error-overlay-body">
            <p class="error-overlay-msg"></p>
            <p class="error-overlay-note">The system remains operational. This has been logged to the audit chain.</p>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.error-overlay-msg').textContent = message;
    overlay.style.display = 'flex';
    // Auto-dismiss after 8 seconds
    setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 8000);
  }

  // --- Vertical Governance Mode Management ---

  async function loadVerticals() {
    try {
      const response = await fetch('/api/verticals');
      if (!response.ok) return;
      const data = await response.json();
      if (!data.ok || !data.verticals) return;

      const select = document.getElementById('vertical-select');
      if (!select) return;

      select.innerHTML = '';
      for (const [key, pack] of Object.entries(data.verticals)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = pack.name;
        if (key === data.active) option.selected = true;
        select.appendChild(option);
      }

      select.addEventListener('change', handleVerticalChange);
      updateVerticalDetails(data.active);
    } catch (e) {
      console.warn('[UI] Failed to load verticals:', e.message);
    }
  }

  async function handleVerticalChange(e) {
    const key = e.target.value;
    if (!key) return;

    try {
      const token = typeof EnlilAPI !== 'undefined' ? EnlilAPI.getToken?.() : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/verticals/active', {
        method: 'POST',
        headers,
        body: JSON.stringify({ vertical: key })
      });

      const data = await response.json();
      if (data.ok) {
        updateVerticalDetails(data.current);
        addOutputCard({
          title: 'Governance Mode Changed',
          content: `Active vertical changed to: ${data.name} (${data.previous} → ${data.current})`,
          posture: 'GREEN'
        });
      } else {
        // Revert dropdown
        updateVerticalDetails(null);
        addOutputCard({
          title: 'Governance Mode Change Failed',
          content: data.error || 'Insufficient permissions. Admin or Owner role required.',
          posture: 'AMBER'
        });
      }
    } catch (e) {
      console.error('[UI] Failed to change vertical:', e.message);
    }
  }

  async function updateVerticalDetails(key) {
    try {
      const response = await fetch('/api/verticals/active');
      if (!response.ok) return;
      const data = await response.json();
      if (!data.ok || !data.vertical) return;

      const v = data.vertical;
      const nameEl = document.getElementById('vertical-name');
      const focusEl = document.getElementById('vertical-focus');
      const complianceEl = document.getElementById('vertical-compliance');
      const twoPersonEl = document.getElementById('vertical-two-person');

      if (nameEl) nameEl.textContent = v.name || '—';
      if (focusEl) focusEl.textContent = v.description ? v.description.substring(0, 120) + (v.description.length > 120 ? '...' : '') : '—';
      if (complianceEl) complianceEl.textContent = (v.compliance_frameworks || []).join(', ') || '—';
      if (twoPersonEl) twoPersonEl.textContent = v.two_person_rule?.enabled ? '✅ Enabled' : '❌ Disabled';

      // Update dropdown selection
      const select = document.getElementById('vertical-select');
      if (select && v.key) select.value = v.key;
    } catch (e) {
      console.warn('[UI] Failed to update vertical details:', e.message);
    }
  }

  // Initialize verticals after main init
  setTimeout(loadVerticals, 500);

  // Public API
  return {
    init,
    switchTab,
    addOutputCard,
    updateStatusPanel,
    updateLogsDisplay,
    runDemo,
    loadVerticals,
    updateVerticalDetails
  };
})();

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
