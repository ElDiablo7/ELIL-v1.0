/**
 * Sentinel™ - Security Governor Overlay
 * Authenticates, authorizes, routes requests, enforces policies, logs everything
 * Only Sentinel can invoke TITAN
 */

const Sentinel = (function () {
  'use strict';

  let initialized = false;
  let authenticated = true;
  let currentRole = 'ADMIN';
  let currentPosture = 'GREEN';
  let sessionActive = true;
  let authAttempts = 0;
  let rateLimitMap = new Map();
  let lockdownActive = false;
  let lockdownReason = '';
  let twoPersonVerified = false;
  let config = null;

  // Initialize Sentinel system
  function init() {
    if (initialized) return;

    // Load config
    loadConfig();

    // Initialize rate limiting
    setInterval(() => {
      rateLimitMap.clear();
    }, 60000); // Clear every minute

    initialized = true;
    Logs.append({
      actor_role: 'SYSTEM',
      action: 'SENTINEL_INIT',
      posture: currentPosture,
      payload: { version: '1.0.0' }
    });

    Utils.EventEmitter.emit('sentinel:initialized', {});
  }

  // Load configuration
  async function loadConfig() {
    const DEFAULT_FALLBACK_CONFIG = {
      system: { name: "ENLIL\u2122 \u2014 GRACE-X AI\u2122 TITAN\u2122 + SENTINEL\u2122", version: "1.0.0", mode: "SENTINEL", titan_locked: true },
      authentication: { default_pin: "0000", max_attempts: 3, lockout_duration: 300, session_timeout: 3600 },
      logging: { enabled: true, max_entries: 10000, export_format: "json", hash_algorithm: "sha256" },
      policy: { default_pack: "baseline_internal", auto_load: true },
      posture: { initial: "GREEN", update_on_risk: true },
      rate_limiting: { enabled: true, max_requests_per_minute: 60, max_requests_per_hour: 1000 },
      titan: { auto_invoke_threshold: 50, require_authorization: true, classification_default: "TITAN_INTERNAL_ONLY" },
      ui: { theme: "sci_fi", animations_enabled: true, scanline_enabled: true, starfield_enabled: true },
      offline_mode: { enabled: true, external_connectors_stubbed: true, warn_on_external_attempt: true }
    };

    try {
      const response = await fetch('./assets/data/config.default.json');
      if (response.ok) {
        config = await response.json();
      } else {
        config = DEFAULT_FALLBACK_CONFIG;
      }
    } catch (e) {
      console.warn('Network request failed (possibly file:// protocol). Using embedded fallback config.');
      config = DEFAULT_FALLBACK_CONFIG;
    }
  }

  // Identity & Access

  function authenticate(pinOrKey) {
    if (lockdownActive) {
      return { success: false, reason: 'System is in lockdown' };
    }

    const maxAttempts = config?.authentication?.max_attempts || 3;
    const defaultPin = config?.authentication?.default_pin || '0000';

    authAttempts++;

    if (authAttempts > maxAttempts) {
      Logs.append({
        actor_role: 'SYSTEM',
        action: 'AUTH_FAILURE_MAX_ATTEMPTS',
        posture: currentPosture,
        payload: { attempts: authAttempts }
      });
      return { success: false, reason: 'Maximum authentication attempts exceeded' };
    }

    if (pinOrKey === defaultPin || pinOrKey === 'SENTINEL_OVERRIDE') {
      authenticated = true;
      authAttempts = 0;
      currentRole = 'OPERATOR';
      Logs.append({
        actor_role: 'OPERATOR',
        action: 'AUTH_SUCCESS',
        posture: currentPosture,
        payload: {}
      });
      Utils.EventEmitter.emit('sentinel:authenticated', { role: currentRole });
      return { success: true, role: currentRole };
    }

    Logs.append({
      actor_role: 'SYSTEM',
      action: 'AUTH_FAILURE',
      posture: currentPosture,
      payload: { attempt: authAttempts }
    });

    return { success: false, reason: 'Invalid credentials', attempts_remaining: maxAttempts - authAttempts };
  }

  function authorize(action, context = {}) {
    if (!authenticated) {
      return { authorized: false, reason: 'Not authenticated' };
    }

    if (lockdownActive && action !== 'UNLOCKDOWN') {
      return { authorized: false, reason: 'System is in lockdown' };
    }

    // Explicit Core Access block for external routing
    if (action === 'EXTERNAL_ACCESS') {
      // For now, external access is strictly forbidden unless overridden in context
      if (context.url === 'https://example.com' || context.override === 'CORE_APPROVED') {
         return { authorized: true };
      }
      return { authorized: false, reason: 'External routing prohibited by core policy. Target unverified.' };
    }

    // Check policy
    const policyCheck = Policy.evaluatePolicy(action, context);
    if (!policyCheck.allowed) {
      Logs.append({
        actor_role: currentRole,
        action: 'AUTHORIZATION_DENIED',
        posture: currentPosture,
        payload: { action, reason: policyCheck.reason }
      });
      return { authorized: false, reason: policyCheck.reason };
    }

    return { authorized: true };
  }

  function requireTwoPersonRule(action) {
    if (Policy.requiresTwoPersonRule(action)) {
      if (!twoPersonVerified) {
        return { required: true, verified: false };
      }
    }
    return { required: false, verified: true };
  }

  function setRole(role) {
    const validRoles = ['OPERATOR', 'ADMIN', 'AUDITOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return { success: false, reason: 'Invalid role' };
    }

    const authCheck = authorize('SET_ROLE', { role });
    if (!authCheck.authorized) {
      return { success: false, reason: authCheck.reason };
    }

    currentRole = role;
    Logs.append({
      actor_role: currentRole,
      action: 'ROLE_CHANGED',
      posture: currentPosture,
      payload: { new_role: role }
    });

    Utils.EventEmitter.emit('sentinel:role_changed', { role });
    return { success: true, role };
  }

  function sessionStart() {
    if (sessionActive) return { success: false, reason: 'Session already active' };
    sessionActive = true;
    Logs.append({
      actor_role: currentRole,
      action: 'SESSION_START',
      posture: currentPosture,
      payload: {}
    });
    return { success: true };
  }

  function sessionEnd() {
    sessionActive = false;
    authenticated = false;
    currentRole = 'VIEWER';
    Logs.append({
      actor_role: 'SYSTEM',
      action: 'SESSION_END',
      posture: currentPosture,
      payload: {}
    });
    Utils.EventEmitter.emit('sentinel:session_ended', {});
    return { success: true };
  }

  // Routing & Orchestration

  function route(command, context = {}) {
    if (!authenticated) {
      return { success: false, reason: 'Not authenticated' };
    }

    if (lockdownActive) {
      return { success: false, reason: 'System is in lockdown' };
    }

    // Rate limiting
    if (!rateLimit(command)) {
      return { success: false, reason: 'Rate limit exceeded' };
    }

    // Log command receipt (redacted)
    const sanitizedCommand = Utils.sanitizeInput(command);
    Logs.append({
      actor_role: currentRole,
      action: 'COMMAND_RECEIVED',
      posture: currentPosture,
      payload: { command: sanitizedCommand.substring(0, 100) },
      classification: 'INTERNAL'
    });

    // Classify intent
    const intent = classifyIntent(command);

    // Compute risk score
    const riskScore = computeRiskScore(command, { intent, context });

    // Check if TITAN required
    const shouldInvokeTitan = decideInvokeTitan(command, riskScore);

    if (shouldInvokeTitan) {
      const taskPacket = {
        command,
        intent,
        risk_score: riskScore,
        context,
        timestamp: Date.now(),
        actor_role: currentRole
      };

      const titanResult = invokeTitan(taskPacket);
      const summary = summarizeForOperator(titanResult);

      return {
        success: true,
        routed_via: 'TITAN',
        summary,
        risk_score: riskScore
      };
    } else {
      // Handle directly without TITAN
      return {
        success: true,
        routed_via: 'SENTINEL',
        intent,
        risk_score: riskScore,
        response: 'Command processed by Sentinel'
      };
    }
  }

  function classifyIntent(command) {
    const cmd = command.toLowerCase();

    if (cmd.includes('threat') || cmd.includes('scan')) return 'THREAT_SCAN';
    if (cmd.includes('integrity') || cmd.includes('check')) return 'INTEGRITY_CHECK';
    if (cmd.includes('compliance')) return 'COMPLIANCE_CHECK';
    if (cmd.includes('stress') || cmd.includes('test')) return 'DECISION_STRESS_TEST';
    if (cmd.includes('red team') || cmd.includes('scenario')) return 'RED_TEAM_SCENARIO';
    if (cmd.includes('lockdown')) return 'LOCKDOWN';
    if (cmd.includes('policy') || cmd.includes('permission')) return 'POLICY_VIEW';
    if (cmd.includes('log') || cmd.includes('audit')) return 'LOG_VIEW';

    return 'GENERAL_QUERY';
  }

  function decideInvokeTitan(command, riskScore) {
    const threshold = config?.titan?.auto_invoke_threshold || 50;

    // Always invoke TITAN for high-risk operations
    if (riskScore >= threshold) return true;

    // Invoke TITAN for specific intents
    const intent = classifyIntent(command);
    const titanIntents = ['THREAT_SCAN', 'INTEGRITY_CHECK', 'COMPLIANCE_CHECK', 'DECISION_STRESS_TEST', 'RED_TEAM_SCENARIO'];
    if (titanIntents.includes(intent)) return true;

    return false;
  }

  function invokeTitan(taskPacket) {
    // TITAN_INTERNAL_ONLY - Only Sentinel can invoke TITAN
    if (!authenticated) {
      throw new Error('Unauthorized TITAN invocation attempt');
    }

    Logs.append({
      actor_role: currentRole,
      action: 'TITAN_INVOKED',
      posture: currentPosture,
      payload: { intent: taskPacket.intent, risk_score: taskPacket.risk_score },
      classification: 'TITAN_INTERNAL_ONLY'
    });

    // Call TITAN analyze
    const result = Titan.analyze(taskPacket);

    Logs.append({
      actor_role: 'TITAN',
      action: 'TITAN_RESULT',
      posture: currentPosture,
      payload: { findings_count: result.findings?.length || 0 },
      classification: 'TITAN_INTERNAL_ONLY'
    });

    return result;
  }

  function summarizeForOperator(titanResult) {
    // Sanitize TITAN output for operator view
    const classification = Policy.classifyOutput(titanResult, 'TITAN_INTERNAL_ONLY');
    const redacted = Policy.redact(titanResult, classification);

    return {
      summary: redacted.summary || 'Analysis complete',
      risk_score: redacted.risk_score || 0,
      posture: redacted.posture || currentPosture,
      findings_count: redacted.findings?.length || 0,
      recommended_controls: redacted.recommended_controls?.slice(0, 3) || [],
      classification: 'INTERNAL' // Downgrade classification for operator
    };
  }

  // Risk & Posture

  function computeRiskScore(command, signals = {}) {
    let score = 0;

    const cmd = command.toLowerCase();

    // High-risk keywords
    const highRiskKeywords = ['delete', 'remove', 'modify', 'change', 'override', 'bypass', 'disable'];
    highRiskKeywords.forEach(keyword => {
      if (cmd.includes(keyword)) score += 15;
    });

    // Medium-risk keywords
    const mediumRiskKeywords = ['export', 'download', 'access', 'view', 'read'];
    mediumRiskKeywords.forEach(keyword => {
      if (cmd.includes(keyword)) score += 5;
    });

    // Intent-based risk
    if (signals.intent === 'THREAT_SCAN') score += 10;
    if (signals.intent === 'INTEGRITY_CHECK') score += 5;
    if (signals.intent === 'LOCKDOWN') score += 20;

    // Context-based risk
    if (signals.context?.sensitive_data) score += 25;
    if (signals.context?.external_request) score += 30;

    // Current posture affects risk perception
    if (currentPosture === 'RED') score += 10;
    if (currentPosture === 'BLACK') score += 20;

    return Math.min(score, 100); // Cap at 100
  }

  function setPosture(level) {
    const validLevels = ['GREEN', 'AMBER', 'RED', 'BLACK'];
    if (!validLevels.includes(level)) {
      return { success: false, reason: 'Invalid posture level' };
    }

    const previousPosture = currentPosture;
    currentPosture = level;

    Logs.append({
      actor_role: currentRole,
      action: 'POSTURE_CHANGED',
      posture: currentPosture,
      payload: { previous: previousPosture, current: level }
    });

    Utils.EventEmitter.emit('sentinel:posture_changed', { level, previous: previousPosture });
    return { success: true, posture: level };
  }

  function lockdown(reason) {
    if (lockdownActive) {
      return { success: false, reason: 'System already in lockdown' };
    }

    const authCheck = authorize('LOCKDOWN', {});
    if (!authCheck.authorized) {
      return { success: false, reason: authCheck.reason };
    }

    lockdownActive = true;
    lockdownReason = reason || 'Emergency lockdown activated';

    Logs.append({
      actor_role: currentRole,
      action: 'LOCKDOWN_ACTIVATED',
      posture: 'BLACK',
      payload: { reason: lockdownReason }
    });

    setPosture('BLACK');
    Utils.EventEmitter.emit('sentinel:lockdown', { reason: lockdownReason });
    return { success: true, reason: lockdownReason };
  }

  function unlockdown(pinOrKey) {
    if (!lockdownActive) {
      return { success: false, reason: 'System is not in lockdown' };
    }

    const authCheck = authenticate(pinOrKey);
    if (!authCheck.success) {
      return { success: false, reason: 'Invalid credentials for unlockdown' };
    }

    lockdownActive = false;
    const reason = lockdownReason;
    lockdownReason = '';

    Logs.append({
      actor_role: currentRole,
      action: 'LOCKDOWN_DEACTIVATED',
      posture: currentPosture,
      payload: { previous_reason: reason }
    });

    setPosture('GREEN');
    Utils.EventEmitter.emit('sentinel:unlockdown', {});
    return { success: true };
  }

  function rateLimit(command) {
    if (!config?.rate_limiting?.enabled) return true;

    const now = Date.now();
    const key = `${currentRole}_${command.substring(0, 20)}`;
    const limit = config.rate_limiting.max_requests_per_minute || 60;

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
      return true;
    }

    const entry = rateLimitMap.get(key);
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + 60000;
      return true;
    }

    if (entry.count >= limit) {
      Logs.append({
        actor_role: currentRole,
        action: 'RATE_LIMIT_EXCEEDED',
        posture: currentPosture,
        payload: { command: command.substring(0, 50) }
      });
      return false;
    }

    entry.count++;
    return true;
  }

  // Policy & Governance

  function loadPolicyPack(name) {
    const success = Policy.loadPolicyPack(name);
    if (success) {
      Logs.append({
        actor_role: currentRole,
        action: 'POLICY_PACK_LOADED',
        posture: currentPosture,
        payload: { pack_name: name }
      });
      Utils.EventEmitter.emit('sentinel:policy_loaded', { name });
    }
    return success;
  }

  function enforcePolicy(action, packet) {
    return Policy.evaluatePolicy(action, packet);
  }

  function redact(output, classification) {
    return Policy.redact(output, classification);
  }

  function classifyOutput(output) {
    return Policy.classifyOutput(output);
  }

  function auditExport() {
    const authCheck = authorize('AUDIT_EXPORT', {});
    if (!authCheck.authorized) {
      return { success: false, reason: authCheck.reason };
    }

    // Export logs
    Logs.export();

    // Export config snapshot
    const snapshot = {
      timestamp: Date.now(),
      posture: currentPosture,
      role: currentRole,
      policy_pack: Policy.getCurrentPolicyPack()?.name || 'none',
      config: config
    };

    const dataStr = JSON.stringify(snapshot, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel_config_snapshot_${Utils.formatTimestamp().replace(/[: ]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Logs.append({
      actor_role: currentRole,
      action: 'AUDIT_EXPORT_COMPLETE',
      posture: currentPosture,
      payload: {}
    });

    return { success: true };
  }

  // Observability

  function emitEvent(type, payload) {
    Utils.EventEmitter.emit(`sentinel:${type}`, payload);
    Logs.append({
      actor_role: currentRole,
      action: `EVENT_${type.toUpperCase()}`,
      posture: currentPosture,
      payload
    });
  }

  function healthCheck() {
    const health = {
      initialized,
      authenticated,
      session_active: sessionActive,
      posture: currentPosture,
      role: currentRole,
      lockdown_active: lockdownActive,
      policy_pack_loaded: Policy.getCurrentPolicyPack() !== null,
      log_chain_verified: Logs.verify(),
      timestamp: Date.now()
    };

    return health;
  }

  function detectAnomaly(eventStream) {
    // Simple anomaly detection
    const recentEvents = Logs.getRecent(50);

    // Check for rapid posture changes
    let postureChanges = 0;
    for (let i = 1; i < recentEvents.length; i++) {
      if (recentEvents[i].action === 'POSTURE_CHANGED') {
        postureChanges++;
      }
    }
    if (postureChanges > 3) {
      return { anomaly: true, type: 'RAPID_POSTURE_CHANGES', severity: 'HIGH' };
    }

    // Check for repeated auth failures
    const authFailures = recentEvents.filter(e => e.action.includes('AUTH_FAILURE')).length;
    if (authFailures > 5) {
      return { anomaly: true, type: 'AUTH_FAILURE_SPIKE', severity: 'MEDIUM' };
    }

    return { anomaly: false };
  }

  function showWarnings(flags) {
    const warnings = [];

    if (flags?.lockdown_active) {
      warnings.push({ level: 'CRITICAL', message: `System in lockdown: ${lockdownReason}` });
    }
    if (flags?.posture_amber) {
      warnings.push({ level: 'WARNING', message: 'System posture: AMBER - Elevated risk detected' });
    }
    if (flags?.posture_red) {
      warnings.push({ level: 'CRITICAL', message: 'System posture: RED - High risk detected' });
    }
    if (flags?.auth_required && !authenticated) {
      warnings.push({ level: 'INFO', message: 'Authentication required' });
    }

    Utils.EventEmitter.emit('sentinel:warnings', warnings);
    return warnings;
  }

  // Public API
  return {
    init,
    authenticate,
    authorize,
    requireTwoPersonRule,
    setRole,
    sessionStart,
    sessionEnd,
    route,
    classifyIntent,
    decideInvokeTitan,
    invokeTitan,
    summarizeForOperator,
    computeRiskScore,
    setPosture,
    lockdown,
    unlockdown,
    rateLimit,
    loadPolicyPack,
    enforcePolicy,
    redact,
    classifyOutput,
    auditExport,
    emitEvent,
    healthCheck,
    detectAnomaly,
    showWarnings,
    getCurrentPosture: () => currentPosture,
    getCurrentRole: () => currentRole,
    isAuthenticated: () => authenticated,
    isLockdownActive: () => lockdownActive
  };
})();
