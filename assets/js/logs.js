/**
 * Immutable Append-Only Logging System
 * Hash chain verification for integrity
 */

const Logs = (function() {
  'use strict';

  const STORAGE_KEY = 'titan_sentinel_logs';
  let logChain = [];

  // Initialize logs from storage
  function init() {
    const stored = Utils.Storage.get(STORAGE_KEY, []);
    if (Array.isArray(stored) && stored.length > 0) {
      logChain = stored;
      // Verify chain integrity on load
      if (!verify()) {
        console.error('Log chain integrity check failed on load');
        // Reset if corrupted
        logChain = [];
        Utils.Storage.set(STORAGE_KEY, []);
      }
    }
  }

  // Append log entry with hash chain
  function append(event) {
    if (!event || typeof event !== 'object') {
      console.error('Invalid log event');
      return false;
    }

    const logEntry = {
      timestamp: event.timestamp || Date.now(),
      actor_role: event.actor_role || 'SYSTEM',
      action: event.action || 'UNKNOWN',
      posture: event.posture || 'GREEN',
      policy_pack: event.policy_pack || 'unknown',
      hash_prev: logChain.length > 0 ? logChain[logChain.length - 1].hash_current : '0',
      payload_summary: sanitizePayload(event.payload || {}),
      classification: event.classification || 'INTERNAL'
    };

    // Calculate current hash
    const hashInput = JSON.stringify({
      timestamp: logEntry.timestamp,
      actor_role: logEntry.actor_role,
      action: logEntry.action,
      posture: logEntry.posture,
      policy_pack: logEntry.policy_pack,
      hash_prev: logEntry.hash_prev,
      payload_summary: logEntry.payload_summary
    });
    logEntry.hash_current = Utils.sha256(hashInput);

    // Append to chain (immutable - no modification allowed)
    logChain.push(logEntry);

    // Persist to storage
    Utils.Storage.set(STORAGE_KEY, logChain);

    // Emit event
    Utils.EventEmitter.emit('log:new', logEntry);

    return true;
  }

  // Sanitize payload for summary (remove sensitive data)
  function sanitizePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return {};
    }

    const sanitized = {};
    const sensitiveKeys = ['password', 'pin', 'key', 'token', 'secret', 'credential'];

    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof payload[key] === 'object') {
          sanitized[key] = sanitizePayload(payload[key]);
        } else {
          sanitized[key] = payload[key];
        }
      }
    }

    return sanitized;
  }

  // Verify hash chain integrity
  function verify() {
    if (logChain.length === 0) return true;

    for (let i = 0; i < logChain.length; i++) {
      const entry = logChain[i];

      // Check previous hash link
      if (i > 0) {
        const prevEntry = logChain[i - 1];
        if (entry.hash_prev !== prevEntry.hash_current) {
          console.error(`Hash chain broken at index ${i}`);
          return false;
        }
      } else {
        // First entry should have hash_prev of '0'
        if (entry.hash_prev !== '0') {
          console.error('First entry hash_prev invalid');
          return false;
        }
      }

      // Verify current hash
      const hashInput = JSON.stringify({
        timestamp: entry.timestamp,
        actor_role: entry.actor_role,
        action: entry.action,
        posture: entry.posture,
        policy_pack: entry.policy_pack,
        hash_prev: entry.hash_prev,
        payload_summary: entry.payload_summary
      });
      const expectedHash = Utils.sha256(hashInput);

      if (entry.hash_current !== expectedHash) {
        console.error(`Hash mismatch at index ${i}`);
        return false;
      }
    }

    return true;
  }

  // Export logs as JSON
  function exportLogs() {
    const dataStr = JSON.stringify(logChain, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `titan_sentinel_logs_${Utils.formatTimestamp().replace(/[: ]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Log the export action
    append({
      actor_role: 'OPERATOR',
      action: 'AUDIT_EXPORT',
      posture: 'GREEN',
      payload: { entry_count: logChain.length }
    });

    return true;
  }

  // Get recent logs
  function getRecent(count = 10) {
    return logChain.slice(-count).reverse();
  }

  // Get all logs
  function getAll() {
    return [...logChain]; // Return copy to prevent modification
  }

  // Get logs by filter
  function getFiltered(filter) {
    if (!filter || typeof filter !== 'object') {
      return getAll();
    }

    return logChain.filter(entry => {
      if (filter.actor_role && entry.actor_role !== filter.actor_role) return false;
      if (filter.action && !entry.action.includes(filter.action)) return false;
      if (filter.posture && entry.posture !== filter.posture) return false;
      if (filter.classification && entry.classification !== filter.classification) return false;
      if (filter.start_time && entry.timestamp < filter.start_time) return false;
      if (filter.end_time && entry.timestamp > filter.end_time) return false;
      return true;
    });
  }

  // Render recent logs to UI
  function renderRecent(container, count = 10) {
    if (!container) return;

    const recent = getRecent(count);
    container.innerHTML = '';

    if (recent.length === 0) {
      container.innerHTML = '<div class="log-entry empty">No log entries</div>';
      return;
    }

    recent.forEach(entry => {
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
        <div class="log-classification">Classification: ${entry.classification}</div>
        ${Object.keys(entry.payload_summary).length > 0 ? 
          `<div class="log-payload">${formatPayload(entry.payload_summary)}</div>` : ''}
        <div class="log-hash" title="Hash: ${entry.hash_current}">${entry.hash_current.substring(0, 8)}...</div>
      `;

      container.appendChild(logEl);
    });
  }

  // Format payload for display
  function formatPayload(payload) {
    if (!payload || typeof payload !== 'object') return '';
    const parts = [];
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const value = typeof payload[key] === 'object' 
          ? JSON.stringify(payload[key]) 
          : String(payload[key]);
        parts.push(`${escapeHtml(key)}: ${escapeHtml(value)}`);
      }
    }
    return parts.join(', ');
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Get statistics
  function getStats() {
    const stats = {
      total_entries: logChain.length,
      by_posture: {},
      by_role: {},
      by_action: {},
      chain_verified: verify(),
      first_entry: logChain.length > 0 ? logChain[0].timestamp : null,
      last_entry: logChain.length > 0 ? logChain[logChain.length - 1].timestamp : null
    };

    logChain.forEach(entry => {
      stats.by_posture[entry.posture] = (stats.by_posture[entry.posture] || 0) + 1;
      stats.by_role[entry.actor_role] = (stats.by_role[entry.actor_role] || 0) + 1;
      stats.by_action[entry.action] = (stats.by_action[entry.action] || 0) + 1;
    });

    return stats;
  }

  // Clear logs (use with extreme caution - for testing only)
  function clear() {
    logChain = [];
    Utils.Storage.set(STORAGE_KEY, []);
    Utils.EventEmitter.emit('log:cleared', {});
  }

  // Initialize on load
  init();

  // Public API
  return {
    append,
    verify,
    export: exportLogs,
    getRecent,
    getAll,
    getFiltered,
    renderRecent,
    getStats,
    clear
  };
})();
