/**
 * Policy Engine
 * Policy pack loading, evaluation, redaction, classification, enforcement
 */

const Policy = (function() {
  'use strict';

  let currentPolicyPack = null;
  let policyPacks = {};
  let twoPersonRuleEnabled = false;
  let twoPersonRuleActions = [];

  // Load policy packs from JSON
  async function loadPolicyPacks() {
    try {
      const response = await fetch('./assets/data/policy_packs.json');
      if (!response.ok) throw new Error('Failed to load policy packs');
      policyPacks = await response.json();
      return true;
    } catch (e) {
      console.error('Error loading policy packs:', e);
      return false;
    }
  }

  // Load a specific policy pack
  function loadPolicyPack(name) {
    if (!policyPacks[name]) {
      console.error(`Policy pack '${name}' not found`);
      return false;
    }

    const pack = policyPacks[name];
    
    // Check if locked
    if (pack.locked) {
      console.warn(`Policy pack '${name}' is locked`);
      return false;
    }

    currentPolicyPack = pack;
    twoPersonRuleEnabled = pack.two_person_rule?.enabled || false;
    twoPersonRuleActions = pack.two_person_rule?.actions || [];

    Utils.EventEmitter.emit('policy:loaded', { name, pack });
    return true;
  }

  // Get current policy pack
  function getCurrentPolicyPack() {
    return currentPolicyPack ? Utils.deepClone(currentPolicyPack) : null;
  }

  // Check if action is allowed
  function isActionAllowed(action) {
    if (!currentPolicyPack) return false;
    return currentPolicyPack.allowed_actions?.includes(action) || false;
  }

  // Check if action is restricted
  function isActionRestricted(action) {
    if (!currentPolicyPack) return false;
    return currentPolicyPack.restricted_actions?.includes(action) || false;
  }

  // Evaluate policy against action and context
  function evaluatePolicy(action, context = {}) {
    if (!currentPolicyPack) {
      return {
        allowed: false,
        reason: 'No policy pack loaded'
      };
    }

    // Check if restricted
    if (isActionRestricted(action)) {
      return {
        allowed: false,
        reason: `Action '${action}' is restricted by current policy`
      };
    }

    // Check if allowed
    if (!isActionAllowed(action)) {
      return {
        allowed: false,
        reason: `Action '${action}' is not allowed by current policy`
      };
    }

    // Check two-person rule
    if (requiresTwoPersonRule(action)) {
      if (!context.two_person_verified) {
        return {
          allowed: false,
          reason: `Action '${action}' requires two-person verification`,
          requires_two_person: true
        };
      }
    }

    return {
      allowed: true,
      reason: 'Policy check passed'
    };
  }

  // Check if action requires two-person rule
  function requiresTwoPersonRule(action) {
    if (!twoPersonRuleEnabled) return false;
    if (twoPersonRuleActions.includes('all')) return true;
    return twoPersonRuleActions.includes(action);
  }

  // Apply redaction based on classification
  function redact(output, classification) {
    if (!currentPolicyPack || !output) return output;

    const redactionRules = currentPolicyPack.redaction_rules || {};
    const rules = redactionRules[classification] || [];

    if (rules.includes('all_details')) {
      return '[REDACTED - CLASSIFIED]';
    }

    if (rules.includes('full_details')) {
      return '[REDACTED - TITAN_INTERNAL_ONLY]';
    }

    let redacted = Utils.deepClone(output);

    // Apply field-level redaction
    if (typeof redacted === 'object') {
      if (rules.includes('all_paths')) {
        redactField(redacted, 'path');
        redactField(redacted, 'file_path');
        redactField(redacted, 'directory');
      }
      if (rules.includes('all_ips')) {
        redactField(redacted, 'ip');
        redactField(redacted, 'ip_address');
        redactField(redacted, 'host');
      }
      if (rules.includes('user_identifiers')) {
        redactField(redacted, 'user');
        redactField(redacted, 'username');
        redactField(redacted, 'user_id');
        redactField(redacted, 'email');
      }
      if (rules.includes('system_details')) {
        redactField(redacted, 'system');
        redactField(redacted, 'hostname');
        redactField(redacted, 'environment');
      }
      if (rules.includes('sensitive_paths')) {
        redactField(redacted, 'path');
        redactField(redacted, 'file_path');
      }
      if (rules.includes('internal_ips')) {
        redactField(redacted, 'ip');
        redactField(redacted, 'ip_address');
      }
      if (rules.includes('findings')) {
        redactField(redacted, 'findings');
        redactField(redacted, 'results');
      }
    }

    return redacted;
  }

  // Helper to redact a field recursively
  function redactField(obj, fieldName) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes(fieldName.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redactField(obj[key], fieldName);
        }
      }
    }
  }

  // Classify output sensitivity
  function classifyOutput(output, defaultClassification = 'INTERNAL') {
    if (!currentPolicyPack) return defaultClassification;

    // Simple heuristics for classification
    const outputStr = JSON.stringify(output).toLowerCase();
    
    // Check for sensitive indicators
    const sensitivePatterns = {
      'TITAN_INTERNAL_ONLY': [
        'titan_internal',
        'internal_only',
        'nucleus',
        'threat_assessment',
        'adversarial'
      ],
      'SECRET': [
        'secret',
        'classified',
        'confidential',
        'credentials',
        'password',
        'token',
        'key'
      ],
      'INTERNAL': [
        'internal',
        'system',
        'config',
        'policy'
      ]
    };

    for (const [classification, patterns] of Object.entries(sensitivePatterns)) {
      for (const pattern of patterns) {
        if (outputStr.includes(pattern)) {
          return classification;
        }
      }
    }

    return defaultClassification;
  }

  // Get escalation rules for a risk level
  function getEscalationRule(riskType) {
    if (!currentPolicyPack) return null;
    const rules = currentPolicyPack.escalation_rules || {};
    return rules[riskType] || null;
  }

  // Get posture threshold
  function getPostureThreshold(posture) {
    if (!currentPolicyPack) return null;
    const thresholds = currentPolicyPack.posture_thresholds || {};
    return thresholds[posture] || null;
  }

  // Get all available policy packs
  function getAvailablePolicyPacks() {
    return Object.keys(policyPacks).map(name => ({
      name,
      display_name: policyPacks[name].name,
      description: policyPacks[name].description,
      locked: policyPacks[name].locked || false
    }));
  }

  // Initialize policy system
  async function init() {
    await loadPolicyPacks();
    // Load default policy pack
    const defaultPack = Utils.Storage.get('default_policy_pack', 'baseline_internal');
    loadPolicyPack(defaultPack);
  }

  // Public API
  return {
    init,
    loadPolicyPack,
    getCurrentPolicyPack,
    isActionAllowed,
    isActionRestricted,
    evaluatePolicy,
    requiresTwoPersonRule,
    redact,
    classifyOutput,
    getEscalationRule,
    getPostureThreshold,
    getAvailablePolicyPacks
  };
})();
