/**
 * CoreAccess - System-wide Gateway for External Resources
 * Enforces Sentinel tracking on all outbound requests, dynamically blocking anything outside 'approved' policies.
 */

const CoreAccess = (function () {
  'use strict';

  // Allowed internal paths
  const ALLOWED_INTERNAL_PREFIXES = [
    './',
    '/',
    'assets/',
    'index.html',
    'titan.html'
  ];

  function isInternal(url) {
    if (!url) return false;
    // Base checks for internal relative paths
    for (let prefix of ALLOWED_INTERNAL_PREFIXES) {
      if (url.startsWith(prefix)) return true;
    }
    // Allow blobs and data URIs for internal processing
    if (url.startsWith('blob:') || url.startsWith('data:')) return true;
    
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.hostname === window.location.hostname;
    } catch(e) {
        return false;
    }
  }

  // --- API Gatekeepers ---

  async function requestIframeAccess(iframeElement, url) {
    if (!iframeElement) return false;
    
    // Always allow internal UI
    if (isInternal(url)) {
      iframeElement.src = url;
      return true;
    }

    // Check with Sentinel if it's external
    const sentinelApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
    
    if (sentinelApp) {
      const result = sentinelApp.authorize('EXTERNAL_ACCESS', { url, override: 'CORE_APPROVED' });
      if (result.authorized) {
        iframeElement.src = url;
        addSystemMessage(`Core Access Granted: Routing to ${url}`);
        return true;
      } else {
        iframeElement.src = 'about:blank';
        addSystemMessage(`Core Access Denied: External access to ${url} blocked by Sentinel Policy. Reason: ${result.reason}`, 'error');
        return false;
      }
    } else {
      iframeElement.src = 'about:blank';
      addSystemMessage(`Core Access Denied: Sentinel Offline. External routing to ${url} prohibited.`, 'error');
      return false;
    }
  }

  // Intercepting fetch globally for external monitoring
  const originalFetch = window.fetch;
  window.fetch = async function () {
    const url = arguments[0];
    
    if (typeof url === 'string' && !isInternal(url)) {
      const sentinelApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
      if (sentinelApp) {
        const result = sentinelApp.authorize('EXTERNAL_ACCESS', { url, override: 'CORE_APPROVED' });
        if (!result.authorized) {
            console.error(`[CoreAccess] Blocked fetch to ${url}`);
            return Promise.reject(new Error(`CoreAccess: Fetch to ${url} blocked by Sentinel.`));
        }
      } else {
          console.error(`[CoreAccess] Blocked fetch to ${url} (Sentinel Offline)`);
          return Promise.reject(new Error(`CoreAccess: Fetch to ${url} blocked (Sentinel Offline).`));
      }
    }
    
    return originalFetch.apply(this, arguments);
  };

  // Intercepting window.open globally
  const originalOpen = window.open;
  window.open = function(url, target, features) {
     if (typeof url === 'string' && !isInternal(url)) {
         const sentinelApp = (window.opener && window.opener.Sentinel) ? window.opener.Sentinel : (typeof Sentinel !== 'undefined' ? Sentinel : null);
         if (sentinelApp) {
            const result = sentinelApp.authorize('EXTERNAL_ACCESS', { url, override: 'CORE_APPROVED' });
            if (!result.authorized) {
                console.error(`[CoreAccess] Blocked window.open to ${url}`);
                addSystemMessage(`Core Access Denied: Blocked attempt to open ${url}`, 'error');
                return null;
            }
         } else {
             console.error(`[CoreAccess] Blocked window.open to ${url} (Sentinel Offline)`);
             addSystemMessage(`Core Access Denied: Blocked attempt to open ${url} (Sentinel Offline)`, 'error');
             return null;
         }
     }
     return originalOpen.call(window, url, target, features);
  };

  // Helper to message the Titan UI if available
  function addSystemMessage(msg, type='system') {
    const output = document.getElementById('terminal-output');
    if (output) {
      const div = document.createElement('div');
      div.className = `term-line ${type}`;
      div.textContent = msg;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }
    
    const chat = document.getElementById('os-chat-messages');
    if (chat) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        div.innerHTML = `<strong>CORE:</strong> <span>${msg}</span>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
  }

  return { requestIframeAccess };
})();
