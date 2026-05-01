'use strict';

/**
 * ENLIL™ Vertical Policy Service — Server-Side
 * Loads and manages vertical-specific governance policy packs.
 * Each vertical configures posture thresholds, allowed/restricted actions,
 * compliance frameworks, escalation rules, and two-person rule settings.
 */

const fs = require('fs');
const path = require('path');

const VERTICAL_FILE = path.join(__dirname, '..', '..', 'assets', 'data', 'vertical_packs.json');
const DEFAULT_VERTICAL = 'ai_agency';

let verticalPacks = {};
let activeVertical = DEFAULT_VERTICAL;
let loaded = false;

function initialize() {
  if (loaded) return;

  try {
    if (!fs.existsSync(VERTICAL_FILE)) {
      console.warn('[VERTICAL] Vertical packs file not found, using empty defaults');
      verticalPacks = {};
      loaded = true;
      return;
    }

    const raw = fs.readFileSync(VERTICAL_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    // Validate structure — each entry must have name, vertical, allowed_actions
    const validPacks = {};
    for (const [key, pack] of Object.entries(parsed)) {
      if (pack && typeof pack.name === 'string' && Array.isArray(pack.allowed_actions)) {
        validPacks[key] = pack;
      } else {
        console.warn(`[VERTICAL] Skipping invalid vertical pack: ${key}`);
      }
    }

    verticalPacks = validPacks;
    const count = Object.keys(verticalPacks).length;
    console.log(`[VERTICAL] Loaded ${count} vertical policy packs`);

    // Validate default vertical exists
    if (!verticalPacks[DEFAULT_VERTICAL] && count > 0) {
      activeVertical = Object.keys(verticalPacks)[0];
      console.warn(`[VERTICAL] Default vertical '${DEFAULT_VERTICAL}' not found, using '${activeVertical}'`);
    } else if (count === 0) {
      console.warn('[VERTICAL] No valid vertical packs loaded');
    }

  } catch (e) {
    console.error('[VERTICAL] Failed to load vertical packs:', e.message);
    verticalPacks = {};
  }

  loaded = true;
}

function getAll() {
  initialize();
  const summary = {};
  for (const [key, pack] of Object.entries(verticalPacks)) {
    summary[key] = {
      name: pack.name,
      vertical: pack.vertical || key,
      version: pack.version || '1.0',
      description: pack.description || '',
      compliance_frameworks: pack.compliance_frameworks || [],
      two_person_rule: pack.two_person_rule?.enabled || false
    };
  }
  return summary;
}

function getActive() {
  initialize();
  const pack = verticalPacks[activeVertical];
  if (!pack) {
    return {
      key: activeVertical,
      name: 'Unknown',
      description: 'No vertical pack loaded',
      vertical: activeVertical,
      compliance_frameworks: [],
      posture_thresholds: { GREEN: 0, AMBER: 25, RED: 50, BLACK: 75 }
    };
  }
  return {
    key: activeVertical,
    ...pack
  };
}

function getActiveKey() {
  initialize();
  return activeVertical;
}

function setActive(key) {
  initialize();
  if (!verticalPacks[key]) {
    return { success: false, error: `Unknown vertical: ${key}. Available: ${Object.keys(verticalPacks).join(', ')}` };
  }
  const previousVertical = activeVertical;
  activeVertical = key;
  return {
    success: true,
    previous: previousVertical,
    current: activeVertical,
    name: verticalPacks[key].name
  };
}

/**
 * Get vertical-specific rule matches for a command category.
 * Returns which vertical rules are relevant to the current action.
 */
function getVerticalRules(category) {
  initialize();
  const pack = verticalPacks[activeVertical];
  if (!pack) return { matchedRules: [], restricted: false, escalation: null };

  const matchedRules = [];
  const isRestricted = (pack.restricted_actions || []).includes(category);
  const isAllowed = (pack.allowed_actions || []).includes(category);

  if (isRestricted) {
    matchedRules.push(`${category} is restricted under ${pack.name}`);
  }
  if (isAllowed) {
    matchedRules.push(`${category} is allowed under ${pack.name}`);
  }
  if (pack.two_person_rule?.enabled && (pack.two_person_rule.actions || []).includes(category)) {
    matchedRules.push(`${category} requires two-person approval under ${pack.name}`);
  }

  // Check escalation rules
  let escalation = null;
  if (pack.escalation_rules) {
    for (const [trigger, action] of Object.entries(pack.escalation_rules)) {
      if (trigger === 'any_anomaly' || trigger === 'high_risk') {
        escalation = action;
      }
    }
  }

  return {
    matchedRules,
    restricted: isRestricted,
    allowed: isAllowed,
    escalation,
    twoPersonRequired: pack.two_person_rule?.enabled && (pack.two_person_rule.actions || []).includes(category),
    complianceFrameworks: pack.compliance_frameworks || [],
    postureThresholds: pack.posture_thresholds || null
  };
}

module.exports = {
  initialize,
  getAll,
  getActive,
  getActiveKey,
  setActive,
  getVerticalRules,
  DEFAULT_VERTICAL
};
