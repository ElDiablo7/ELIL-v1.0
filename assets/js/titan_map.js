/**
 * TITAN Command Center Map & Chat Logic
 * Handles interactive system mapping and direct module communication.
 */

const TitanMap = (function () {
  'use strict';

  let activeModule = 'TITAN';

  function init() {
    setupUI();
    console.log('[TITAN MAP] Initialize Command Center.');
  }

  function setupUI() {
    // Open CC
    const modeTitanBtn = document.getElementById('mode-titan');
    if (modeTitanBtn) {
      modeTitanBtn.addEventListener('click', openCommandCenter);
      // Remove locked title if exists
      modeTitanBtn.title = 'Open TITAN Command Center';
    }

    // Close CC
    const closeBtn = document.getElementById('titan-cc-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCommandCenter);

    // Map Node Selection
    const nodes = document.querySelectorAll('.map-node');
    nodes.forEach(node => {
      node.addEventListener('click', (e) => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        activeModule = node.dataset.target;
        
        document.getElementById('chat-active-module').textContent = `Uplink: ${activeModule}`;
        addChatMessage('system', `Channel switched to ${activeModule}. Ready for input.`);
        
        if (activeModule === 'GRACE' && typeof GraceX_Voice !== 'undefined') {
          addChatMessage('GRACE', "I'm listening.");
        }
      });
    });

    // Chatbox Input
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatInput();
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', handleChatInput);
    }
  }

  function openCommandCenter() {
    const cc = document.getElementById('titan-command-center');
    if (cc) {
      cc.classList.add('active');
      if (window.Logs) window.Logs.append({ action: 'TITAN_COMMAND_CENTER_ACCESSED', actor_role: 'OPERATOR' });
      addChatMessage('system', 'TITAN Command Center Online.', true);
    }
  }

  function closeCommandCenter() {
    const cc = document.getElementById('titan-command-center');
    if (cc) cc.classList.remove('active');
  }

  async function handleChatInput() {
    const input = document.getElementById('chat-input');
    const command = input.value.trim();
    if (!command) return;

    input.value = '';
    addChatMessage('user', command);

    // Process Tasking
    if (command.toLowerCase().startsWith('task:')) {
      handleTasking(command.substring(5).trim());
      return;
    }

    // Route to Modules
    try {
      simulateProcessing(activeModule);
      let response = '';

      // Give a tiny delay for realism and to allow "processing" dots to show
      await new Promise(r => setTimeout(r, 800));

      switch (activeModule) {
        case 'TITAN':
          if (window.Titan) {
             const res = window.Titan.analyze({ action: command, context: 'Command Center Direct Input' });
             response = (res && res.summary) ? `${res.summary} [Risk: ${res.risk_score || 0}]` : 'Behavior logged. No threat detected.';
          }
          addChatMessage('TITAN', response);
          break;
        case 'SENTINEL':
          if (window.Sentinel) {
             const res = window.Sentinel.route(command, {});
             response = res.summary || res.response || 'Routing failed.';
          }
          addChatMessage('SENTINEL', response);
          break;
        case 'GRACE':
          if (window.GraceX_Voice) {
             response = "Acknowledged. Audio protocol engaged.";
             window.GraceX_Voice.speak(command);
          } else {
             response = "GRACE Voice Protocol offline.";
          }
          addChatMessage('GRACE', response);
          break;
        case 'TRAINING':
          response = "Training module does not accept direct conversational input. Please use the Training Index to launch scenarios.";
          addChatMessage('TRAINING', response);
          break;
        default:
          addChatMessage('system', `Unknown module: ${activeModule}`);
      }
    } catch (e) {
      console.error(e);
      addChatMessage('system', `Error communicating with ${activeModule}: ${e.message}`, true);
    }
  }

  function handleTasking(task) {
    addChatMessage('system', `Task initiated via ${activeModule}: [${task}]`);
    
    // Simulate task delegation
    setTimeout(() => {
      addChatMessage(activeModule, `Task logged securely. Operations flagged for review.`);
      if (window.Logs) window.Logs.append({ action: 'TASK_DELEGATION', target: activeModule, details: task });
    }, 1000);
  }

  function simulateProcessing(module) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `chat-message ${module} processing`;
    div.id = 'temp-processing';
    div.innerHTML = `<span class="processing-dots">Processing...</span>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  function addChatMessage(sender, text, isError = false) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    // Remove processing indicator if exists
    const temp = document.getElementById('temp-processing');
    if (temp) temp.remove();

    const div = document.createElement('div');
    div.className = `chat-message ${sender} ${isError ? 'error' : ''}`;
    
    // Render formatted response
    div.innerHTML = `<strong>${sender.toUpperCase()}:</strong> <span>${escapeHtml(text)}</span>`;
    
    messages.appendChild(div);
    scrollToBottom();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    const messages = document.getElementById('chat-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  return {
    init,
    open: openCommandCenter,
    close: closeCommandCenter
  };
})();

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', TitanMap.init);
} else {
  TitanMap.init();
}
