/**
 * TITAN OS - Standalone Dashboard Logic
 * Handles Agent Roster, Internet Uplink, Local Terminal, and Chat.
 */

const TitanOS = (function () {
  'use strict';

  let activeAgentId = null;

  // Define the roster of autonomous TITAN Agents
  const agentRoster = [
    { id: 'guardian', name: 'GUARDIAN', role: 'Defensive Perimeter & Shielding', status: 'ONLINE' },
    { id: 'forge', name: 'FORGE', role: 'Logic Construction & Core Synthesis', status: 'ONLINE' },
    { id: 'venus', name: 'VENUS', role: 'External Intelligence & Recon', status: 'ONLINE' },
    { id: 'titan', name: 'TITAN', role: 'Strategic Nucleus & Threat Analysis', status: 'ONLINE' },
    { id: 'sentinel', name: 'SENTINEL', role: 'Governance Overlay & Policy Enforcement', status: 'ONLINE' }
  ];

  function init() {
    console.log('[TITAN OS] Initializing...');
    if (!window.opener && typeof Sentinel !== 'undefined' && Sentinel.init) {
        Sentinel.init().catch(console.error);
    }
    buildAgentRoster();
    setupBrowser();
    setupTerminal();
    setupChat();
  }

  // --- AGENT ROSTER ---
  function buildAgentRoster() {
    const list = document.getElementById('agent-list');
    if (!list) return;

    list.innerHTML = '';
    agentRoster.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'agent-card';
      card.dataset.id = agent.id;
      card.innerHTML = `
        <div class="agent-name">${agent.name.toUpperCase()}</div>
        <div class="agent-role">${agent.role.toUpperCase()}</div>
      `;

      card.addEventListener('click', () => selectAgent(agent.id));
      list.appendChild(card);
    });

    // Select the first agent by default
    selectAgent(agentRoster[0].id);
  }

  function selectAgent(agentId) {
    activeAgentId = agentId;
    const cards = document.querySelectorAll('.agent-card');
    cards.forEach(card => {
      if (card.dataset.id === agentId) card.classList.add('active');
      else card.classList.remove('active');
    });

    const agent = agentRoster.find(a => a.id === agentId);
    if (agent) {
      document.getElementById('chat-active-agent').textContent = `Direct Channel: ${agent.name.toUpperCase()}`;
      
      const chatInput = document.getElementById('os-chat-input');
      const chatBtn = document.getElementById('os-chat-send');
      if (chatInput) chatInput.disabled = false;
      if (chatBtn) chatBtn.disabled = false;

      addChatMessage('system', `Channel switched to ${agent.name}. Encryption verified.`);
    }
  }

  // --- INTERNET UPLINK (Iframe) ---
  function setupBrowser() {
    const btn = document.getElementById('browser-go');
    const input = document.getElementById('browser-url');
    const iframe = document.getElementById('titan-browser');

    if (!btn || !input || !iframe) return;

    const loadUrl = () => {
      let url = input.value.trim();
      if (!url) return;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      addChatMessage('system', `Requesting Core approval for Internet Uplink routing to: ${url}`);
      CoreAccess.requestIframeAccess(iframe, url);
    };

    btn.addEventListener('click', loadUrl);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loadUrl();
    });
  }

  // --- LOCAL TERMINAL ---
  function setupTerminal() {
    const input = document.getElementById('terminal-input');
    if (!input) return;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (!cmd) return;
        input.value = '';
        
        printToTerminal(`C:\\ENLIL\\NODE> ${cmd}`, 'user');
        processTerminalCommand(cmd);
      }
    });
  }

  function printToTerminal(text, type = 'system') {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const div = document.createElement('div');
    div.className = `term-line ${type}`;
    div.textContent = text;
    
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function processTerminalCommand(cmd) {
    const command = cmd.toLowerCase();
    setTimeout(() => {
      switch (command) {
        case 'help':
          printToTerminal('Available internal commands:');
          printToTerminal('  dir      - List directory contents');
          printToTerminal('  netstat  - Display active network connections');
          printToTerminal('  ping     - Verify external connectivity');
          printToTerminal('  clear    - Clear terminal window');
          printToTerminal('  status   - Display TITAN engine status');
          printToTerminal('  logs     - Show recent audit events');
          break;
        case 'status':
          const sApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
          if (sApp) {
              const h = sApp.healthCheck();
              let emoji = h.posture === 'BLACK' ? '⚫' : (h.posture === 'RED' ? '🔴' : (h.posture === 'AMBER' ? '🟡' : '🟢'));
              printToTerminal(`TITAN ENGINE: ${h.initialized ? 'ONLINE' : 'OFFLINE'}`);
              printToTerminal(`SENTINEL POSTURE: ${emoji} ${h.posture}`);
              printToTerminal(`LOG CHAIN: ${h.log_chain_verified ? 'VERIFIED' : 'FAILED'}`);
          } else {
              printToTerminal('TITAN ENGINE CONNECTION FAILED (CORE OFFLINE OR RESTRICTED BY BROWSER POLICY)', 'error');
          }
          break;
        case 'logs':
          const logsApp = (window.opener && window.opener.Logs) ? window.opener.Logs : (typeof Logs !== 'undefined' ? Logs : null);
          if (logsApp) {
              const recent = logsApp.getRecent(5);
              if (recent.length === 0) {
                  printToTerminal('No recent logs found.');
              } else {
                  recent.forEach(log => {
                      printToTerminal(`[${log.action}] Posture: ${log.posture} | Rank: ${log.classification}`);
                  });
              }
          } else {
              printToTerminal('LOGS SUBSYSTEM CONNECTION FAILED', 'error');
          }
          break;
        case 'dir':
          printToTerminal(' Volume in drive C is ENLIL_CORE');
          printToTerminal(' Directory of C:\\ENLIL\\NODE');
          printToTerminal(' 03/14/2026  14:02    <DIR>          config');
          printToTerminal(' 03/14/2026  14:02    <DIR>          logs');
          printToTerminal(' 03/14/2026  14:02            45,192 sys_kernel.bin');
          printToTerminal('               1 File(s)         45,192 bytes');
          break;
        case 'netstat':
          printToTerminal('Active Connections');
          printToTerminal('  Proto  Local Address          Foreign Address        State');
          printToTerminal('  TCP    10.0.0.4:443           192.168.1.50:52134     ESTABLISHED');
          printToTerminal('  TCP    10.0.0.4:8080          --                     LISTENING');
          break;
        case 'ping':
          printToTerminal('Pinging 8.8.8.8 with 32 bytes of data:');
          printToTerminal('Reply from 8.8.8.8: bytes=32 time=12ms TTL=117');
          printToTerminal('Reply from 8.8.8.8: bytes=32 time=11ms TTL=117');
          printToTerminal('Ping statistics for 8.8.8.8: Packets: Sent = 2, Received = 2');
          break;
        case 'clear':
          const output = document.getElementById('terminal-output');
          if (output) output.innerHTML = '';
          break;
        default:
          const defaultSApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
          const defaultTApp = (window.opener && window.opener.Titan) ? window.opener.Titan : (typeof Titan !== 'undefined' ? Titan : null);
          
          if (defaultSApp && defaultTApp) {
             const intent = defaultSApp.classifyIntent(cmd);
             const riskScore = defaultSApp.computeRiskScore(cmd, { intent });
             const taskPacket = {
                 command: cmd,
                 intent: intent,
                 risk_score: riskScore,
                 context: { source: 'local_terminal' },
                 actor_role: 'TITAN_OPERATOR'
             };
             const result = defaultTApp.analyze(taskPacket);
             if (result.findings && result.findings.length > 0) {
                 printToTerminal(`Analysis Complete. Risk: ${result.risk_score} [${result.posture}]`);
                 result.findings.slice(0,3).forEach(f => printToTerminal(`  - [${f.severity}] ${f.description}`, 'error'));
             } else {
                 printToTerminal(result.summary);
             }
          } else {
             printToTerminal(`'${cmd}' is not recognized as an internal or external command.`, 'error');
          }
      }
    }, 400); // Simulate processing time
  }

  // --- AGENT CHAT ---
  function setupChat() {
    const input = document.getElementById('os-chat-input');
    const sendBtn = document.getElementById('os-chat-send');

    if (!input || !sendBtn) return;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
    sendBtn.addEventListener('click', handleChatSubmit);
  }

  function handleChatSubmit() {
    const input = document.getElementById('os-chat-input');
    const msg = input.value.trim();
    if (!msg || !activeAgentId) return;

    input.value = '';
    addChatMessage('user', msg);
    
    // Simulate Agent processing delay
    simulateProcessing();
    
    setTimeout(() => {
      const agent = agentRoster.find(a => a.id === activeAgentId);
      const agentName = agent ? agent.name : 'Unknown Agent';
      
      const titanApp = (window.opener && window.opener.Titan) ? window.opener.Titan : (typeof Titan !== 'undefined' ? Titan : null);
      const sentinelApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
      
      let response = '';
      let isHtml = false;
      if (titanApp) {
          let intent = 'GENERAL_QUERY';
          let riskScore = 50;
          if (sentinelApp) {
              intent = sentinelApp.classifyIntent(msg);
              riskScore = sentinelApp.computeRiskScore(msg, { intent, context: { agent: agentName } });
          }
          const taskPacket = {
              command: msg,
              intent: intent,
              risk_score: riskScore,
              context: { agent: agentName },
              actor_role: 'TITAN_OPERATOR'
          };
          const result = titanApp.analyze(taskPacket);
          let emoji = result.posture === 'BLACK' ? '⚫' : (result.posture === 'RED' ? '🔴' : (result.posture === 'AMBER' ? '🟡' : '🟢'));
          response = `<strong>Analysis Complete. Risk Score: ${result.risk_score} [${emoji} ${result.posture}]</strong><br>`;
          if (result.findings && result.findings.length > 0) {
              response += '<em>Findings:</em><ul>';
              result.findings.slice(0, 3).forEach(f => {
                  response += `<li>${f.type}: ${f.description}</li>`;
              });
              response += '</ul>';
          } else {
              if (msg.toLowerCase().startsWith('task:')) {
                  response += `<br>Task accepted by ${agentName}. Integrating into operational queue.`;
              } else {
                  response += `<br>Message processed by ${agentName}. No critical anomalies detected in inputs.`;
              }
          }
          isHtml = true;
      } else {
          if (msg.toLowerCase().startsWith('task:')) {
            response = `Task accepted. Integrating '${msg.substring(5).trim()}' into operational queue.`;
          } else {
            response = `Message received by ${agentName}. Analyzing parameters... (Engine Offline / Disconnected)`;
          }
      }

      addChatMessage(agentName, response, isHtml);
    }, 800);
  }

  function simulateProcessing() {
    const messages = document.getElementById('os-chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `chat-message system processing`;
    div.id = 'temp-processing';
    div.innerHTML = `<span class="processing-dots">Agent processing...</span>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  function addChatMessage(sender, text, isHtml = false) {
    const messages = document.getElementById('os-chat-messages');
    if (!messages) return;

    const temp = document.getElementById('temp-processing');
    if (temp) temp.remove();

    const div = document.createElement('div');
    div.className = `chat-message ${sender === 'user' ? 'user' : (sender === 'system' ? 'system' : 'agent')}`;
    
    const content = isHtml ? text : escapeHtml(text);
    div.innerHTML = `<strong>${sender.toUpperCase()}:</strong> <span>${content}</span>`;
    
    messages.appendChild(div);
    scrollToBottom();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    const messages = document.getElementById('os-chat-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  return { init };
})();

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', TitanOS.init);
} else {
  TitanOS.init();
}
