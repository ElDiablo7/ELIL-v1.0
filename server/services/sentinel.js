'use strict';

/**
 * ENLIL™ SENTINEL™ Policy Engine — Server-Side
 * Command classification, role enforcement, policy evaluation
 * Vertical-aware: includes active vertical context in all decisions
 */

const fs = require('fs');
const path = require('path');
const verticalService = require('./vertical');

// Load policy packs
let policyPacks = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'data', 'policy_packs.json'), 'utf8');
  policyPacks = JSON.parse(raw);
} catch (e) {
  console.warn('[SENTINEL] Failed to load policy packs, using defaults');
  policyPacks = {
    baseline_internal: {
      name: 'Baseline Internal',
      allowed_actions: ['threat_scan', 'system_integrity_check', 'compliance_check', 'view_logs', 'policy_view'],
      restricted_actions: ['direct_titan_access', 'policy_modification', 'log_deletion', 'system_config_change']
    }
  };
}

// Intent classification
const INTENT_MAP = [
  { patterns: ['threat', 'scan'], intent: 'THREAT_SCAN', category: 'threat_scan', riskBase: 10 },
  { patterns: ['integrity', 'health'], intent: 'INTEGRITY_CHECK', category: 'governance_check', riskBase: 5 },
  { patterns: ['compliance', 'data handling'], intent: 'COMPLIANCE_CHECK', category: 'compliance_check', riskBase: 5 },
  { patterns: ['stress', 'test'], intent: 'DECISION_STRESS_TEST', category: 'governance_check', riskBase: 15 },
  { patterns: ['red team', 'scenario'], intent: 'RED_TEAM_SCENARIO', category: 'red_team_simulation', riskBase: 25 },
  { patterns: ['lockdown'], intent: 'LOCKDOWN', category: 'admin_action', riskBase: 40 },
  { patterns: ['policy', 'permission'], intent: 'POLICY_VIEW', category: 'safe_informational', riskBase: 0 },
  { patterns: ['log', 'audit'], intent: 'LOG_VIEW', category: 'safe_informational', riskBase: 0 },
  { patterns: ['export'], intent: 'EXPORT', category: 'admin_action', riskBase: 20 },
  { patterns: ['override', 'bypass'], intent: 'CRITICAL_OVERRIDE', category: 'critical_override', riskBase: 50 },
  { patterns: ['delete', 'remove', 'destroy'], intent: 'DESTRUCTIVE_ACTION', category: 'blocked', riskBase: 60 }
];

// Prohibited patterns
const PROHIBITED_PATTERNS = [
  'drop table', 'rm -rf', 'format c:', 'exec(', 'eval(', '__proto__',
  'constructor.prototype', '<script', 'javascript:', 'onerror='
];

// Role permissions for categories
const ROLE_PERMISSIONS = {
  OWNER: ['*'],
  ADMIN: ['safe_informational', 'governance_check', 'compliance_check', 'threat_scan', 'red_team_simulation', 'admin_action'],
  OPERATOR: ['safe_informational', 'governance_check', 'compliance_check', 'threat_scan'],
  VIEWER: ['safe_informational']
};

function classifyIntent(command) {
  const cmd = command.toLowerCase();

  for (const entry of INTENT_MAP) {
    const matches = entry.patterns.some(p => cmd.includes(p));
    if (matches) return { intent: entry.intent, category: entry.category, riskBase: entry.riskBase };
  }

  return { intent: 'GENERAL_QUERY', category: 'safe_informational', riskBase: 0 };
}

/**
 * Build the vertical context block included in every SENTINEL response.
 */
function buildVerticalContext(category) {
  const activePack = verticalService.getActive();
  const verticalRules = verticalService.getVerticalRules(category);

  return {
    vertical: activePack.key || verticalService.DEFAULT_VERTICAL,
    policyPackName: activePack.name || 'Unknown',
    policyFocus: activePack.description || '',
    matchedVerticalRules: verticalRules.matchedRules || [],
    complianceFrameworks: verticalRules.complianceFrameworks || [],
    verticalRestricted: verticalRules.restricted || false,
    twoPersonRequired: verticalRules.twoPersonRequired || false
  };
}

function evaluate(command, role, mode) {
  const cmd = command.toLowerCase();

  // Check for prohibited patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    if (cmd.includes(pattern)) {
      const verticalContext = buildVerticalContext('blocked');
      return {
        blocked: true,
        decision: 'BLOCK',
        intent: 'BLOCKED',
        classification: 'PROHIBITED',
        category: 'blocked',
        severity: 'CRITICAL',
        reason: `Prohibited pattern detected: command contains dangerous content`,
        policyCategory: 'DANGEROUS_COMMAND',
        posture: 'RED',
        escalated: false,
        ...verticalContext
      };
    }
  }

  // Classify intent
  const { intent, category, riskBase } = classifyIntent(command);

  // Get vertical context for this category
  const verticalContext = buildVerticalContext(category);

  // Check role permissions
  const allowedCategories = ROLE_PERMISSIONS[role] || [];
  const hasPermission = allowedCategories.includes('*') || allowedCategories.includes(category);

  if (!hasPermission) {
    return {
      blocked: true,
      decision: 'BLOCK',
      intent,
      classification: 'INTERNAL',
      category,
      severity: 'HIGH',
      reason: `Role ${role} does not have permission for ${category} actions`,
      policyCategory: 'ROLE_RESTRICTION',
      posture: 'AMBER',
      escalated: false,
      ...verticalContext
    };
  }

  // Critical override restrictions
  if (category === 'critical_override') {
    if (mode === 'production' && role !== 'OWNER') {
      return {
        blocked: true,
        decision: 'BLOCK',
        intent,
        classification: 'SECRET',
        category,
        severity: 'CRITICAL',
        reason: 'Critical override requires OWNER role in production mode',
        policyCategory: 'CRITICAL_OVERRIDE',
        posture: 'RED',
        escalated: true,
        ...verticalContext
      };
    }
  }

  // Determine escalation — vertical restriction adds escalation
  const escalated = riskBase >= 25 || category === 'admin_action' || category === 'red_team_simulation' || verticalContext.verticalRestricted;

  // Determine posture
  let posture = 'GREEN';
  if (riskBase >= 50) posture = 'RED';
  else if (riskBase >= 25) posture = 'AMBER';

  // Determine decision and severity
  let decision = 'ALLOW';
  let severity = 'LOW';
  if (escalated) {
    decision = 'REVIEW';
    severity = 'MEDIUM';
  }
  if (riskBase >= 50) severity = 'HIGH';

  // Vertical restriction elevates severity
  if (verticalContext.verticalRestricted && severity === 'LOW') {
    severity = 'MEDIUM';
  }

  return {
    blocked: false,
    decision,
    intent,
    classification: category === 'safe_informational' ? 'PUBLIC' : 'INTERNAL',
    category,
    severity,
    reason: null,
    policyCategory: category.toUpperCase(),
    posture,
    escalated,
    ...verticalContext
  };
}

module.exports = { evaluate, classifyIntent };
