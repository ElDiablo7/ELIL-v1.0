/**
 * Identity Verification Module (STUB — OFFLINE ONLY)
 * Aligns with VerificationReport intent; no external APIs. Connectors stubbed with warnings.
 */

const Verification = (function() {
  'use strict';

  let initialized = false;
  let stubWarningShown = false;

  const STUB_WARNING = 'External connectors are stubbed. No external verification calls.';

  function init() {
    if (initialized) return;

    if (typeof Logs !== 'undefined' && Logs.append) {
      Logs.append({
        actor_role: 'SYSTEM',
        action: 'VERIFICATION_INIT_STUB',
        posture: 'GREEN',
        payload: { message: STUB_WARNING },
        classification: 'INTERNAL'
      });
    }

    if (!stubWarningShown && typeof Utils !== 'undefined' && Utils.EventEmitter) {
      Utils.EventEmitter.emit('verification:stub_warning', { message: STUB_WARNING });
      stubWarningShown = true;
    }

    initialized = true;
  }

  /**
   * Stub: document check. Returns simulated local result only.
   */
  function checkDocument() {
    if (!initialized) init();

    const result = {
      status: 'verified',
      stub: true,
      message: STUB_WARNING,
      timestamp: Date.now()
    };

    if (typeof Logs !== 'undefined' && Logs.append) {
      Logs.append({
        actor_role: 'VERIFICATION',
        action: 'CHECK_DOCUMENT_STUB',
        posture: 'GREEN',
        payload: { stub: true }
      });
    }

    return result;
  }

  /**
   * Stub: session/identity check. Returns simulated local result only.
   */
  function checkSession() {
    if (!initialized) init();

    const result = {
      valid: true,
      stub: true,
      message: STUB_WARNING,
      timestamp: Date.now()
    };

    if (typeof Logs !== 'undefined' && Logs.append) {
      Logs.append({
        actor_role: 'VERIFICATION',
        action: 'CHECK_SESSION_STUB',
        posture: 'GREEN',
        payload: { stub: true }
      });
    }

    return result;
  }

  /**
   * Stub: get verification report shape (no external call).
   */
  function getReportShape() {
    if (!initialized) init();
    return {
      id: 'stub-local',
      object: 'identity.verification_report',
      client_reference_id: null,
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      type: 'document',
      verification_session: null,
      stub: true
    };
  }

  function isStub() {
    return true;
  }

  function getWarning() {
    return STUB_WARNING;
  }

  return {
    init,
    checkDocument,
    checkSession,
    getReportShape,
    isStub,
    getWarning
  };
})();
