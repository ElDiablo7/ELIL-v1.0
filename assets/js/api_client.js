/**
 * ENLIL™ API Client — Frontend-to-Backend Bridge
 * Connects the browser UI to the hardened server.
 * Gracefully falls back to client-side logic when backend is unavailable.
 *
 * Copyright © Zachary Charles Anthony Crockett. All rights reserved.
 */

const EnlilAPI = (function () {
  'use strict';

  const BASE_URL = window.location.origin;
  let token = null;
  let currentUser = null;
  let backendAvailable = false;
  let healthCheckTimer = null;

  // --- HTTP Helpers ---

  async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, opts);
    const data = await response.json();

    if (response.status === 401 && data.code === 'INVALID_TOKEN') {
      // Token expired — clear session
      clearSession();
      Utils.EventEmitter.emit('api:session_expired', {});
    }

    return { status: response.status, data };
  }

  // --- Connection Status ---

  async function checkHealth() {
    try {
      const { status, data } = await request('GET', '/api/health');
      backendAvailable = status === 200 && data.status === 'operational';

      updateConnectionIndicator(backendAvailable);
      Utils.EventEmitter.emit('api:health', { available: backendAvailable, data });
      return data;
    } catch (e) {
      backendAvailable = false;
      updateConnectionIndicator(false);
      Utils.EventEmitter.emit('api:health', { available: false, error: e.message });
      return null;
    }
  }

  function startHealthMonitor(intervalMs = 30000) {
    if (healthCheckTimer) clearInterval(healthCheckTimer);
    checkHealth();
    healthCheckTimer = setInterval(checkHealth, intervalMs);
  }

  function updateConnectionIndicator(connected) {
    // Update the system status display in the right panel
    const systemStatus = document.getElementById('system-status');
    if (systemStatus) {
      systemStatus.textContent = connected ? 'Backend Connected' : 'Offline (Demo)';
      systemStatus.style.color = connected ? 'var(--green, #0f0)' : 'var(--amber, #ffa500)';
    }

    // Update audit warning banner if present
    const auditBanner = document.querySelector('.audit-warning-banner');
    if (auditBanner) {
      if (connected) {
        auditBanner.textContent = '✅ Server-side audit chain active — tamper-evident logging via backend.';
        auditBanner.style.borderColor = 'var(--green, #0f0)';
      } else {
        auditBanner.textContent = '⚠ Offline mode — audit logs in browser localStorage. Connect backend for production logging.';
        auditBanner.style.borderColor = 'var(--amber, #ffa500)';
      }
    }
  }

  // --- Authentication ---

  async function login(username, password) {
    try {
      const { status, data } = await request('POST', '/api/auth/login', { username, password });
      if (status === 200 && data.token) {
        token = data.token;
        currentUser = {
          username,
          role: data.role,
          mode: data.mode
        };
        Utils.EventEmitter.emit('api:authenticated', currentUser);
        return { success: true, role: data.role, mode: data.mode };
      }
      return { success: false, reason: data.error || 'Login failed' };
    } catch (e) {
      return { success: false, reason: 'Server unavailable' };
    }
  }

  async function logout() {
    try {
      if (token) await request('POST', '/api/auth/logout');
    } catch (e) {
      // Silent logout even if server unreachable
    }
    clearSession();
    Utils.EventEmitter.emit('api:logged_out', {});
    return { success: true };
  }

  function clearSession() {
    token = null;
    currentUser = null;
  }

  // --- Commands ---

  async function sendCommand(command) {
    if (!backendAvailable || !token) {
      // Fall back to client-side processing
      return { fallback: true, reason: 'Backend unavailable or not authenticated' };
    }

    try {
      const { status, data } = await request('POST', '/api/command', { command });
      if (status === 200) {
        return {
          fallback: false,
          success: data.success,
          eventId: data.eventId,
          sentinel: data.sentinel,
          titan: data.titan,
          posture: data.posture,
          timestamp: data.timestamp
        };
      }
      return { fallback: false, success: false, error: data.error };
    } catch (e) {
      return { fallback: true, reason: e.message };
    }
  }

  // --- Audit ---

  async function getAuditLogs(page = 1, limit = 25) {
    if (!backendAvailable || !token) return null;
    try {
      const { status, data } = await request('GET', `/api/audit?page=${page}&limit=${limit}`);
      return status === 200 ? data : null;
    } catch (e) {
      return null;
    }
  }

  async function verifyAuditChain() {
    if (!backendAvailable || !token) return null;
    try {
      const { status, data } = await request('GET', '/api/audit/verify');
      return status === 200 ? data : null;
    } catch (e) {
      return null;
    }
  }

  async function exportAudit() {
    if (!backendAvailable || !token) return null;
    try {
      const { status, data } = await request('GET', '/api/audit/export');
      if (status === 200) {
        // Trigger download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enlil_audit_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // --- Modules ---

  async function getModules() {
    try {
      const { status, data } = await request('GET', '/api/modules');
      return status === 200 ? data.modules : null;
    } catch (e) {
      return null;
    }
  }

  // --- Initialize ---

  function init() {
    startHealthMonitor();
    console.log('[ENLIL API] Client initialized — monitoring backend connection');
  }

  // --- Public API ---
  return {
    init,
    checkHealth,
    login,
    logout,
    sendCommand,
    getAuditLogs,
    verifyAuditChain,
    exportAudit,
    getModules,
    isBackendAvailable: () => backendAvailable,
    isAuthenticated: () => !!token,
    getCurrentUser: () => currentUser ? { ...currentUser } : null
    // NOTE: Token is not exposed publicly. JWT is managed internally by the API client.
  };
})();
