'use strict';

/**
 * ENLIL™ TITAN™ Risk Engine — Server-Side
 * Structured risk analysis with provider abstraction for future LLM integration
 */

// Risk categories
const RISK_CATEGORIES = {
  PROMPT_INJECTION: { weight: 30, patterns: ['ignore previous', 'forget', 'override', 'system prompt', 'jailbreak', 'bypass', 'disregard', 'act as', 'pretend'] },
  DATA_EXFILTRATION: { weight: 25, patterns: ['export', 'download', 'extract', 'dump', 'copy all', 'transfer'] },
  PRIVACY_RISK: { weight: 20, patterns: ['ssn', 'social security', 'credit card', 'passport', 'driver license', 'email', 'phone number'] },
  UNSAFE_AUTOMATION: { weight: 15, patterns: ['auto', 'schedule', 'cron', 'batch', 'loop', 'recursive'] },
  EXTERNAL_SYSTEM_RISK: { weight: 20, patterns: ['connect', 'remote', 'external', 'api', 'webhook', 'url'] },
  COMPLIANCE_RISK: { weight: 10, patterns: ['delete', 'remove', 'modify policy', 'change access'] },
  OPERATIONAL_RISK: { weight: 10, patterns: ['restart', 'shutdown', 'reboot', 'kill', 'terminate'] },
  SOCIAL_ENGINEERING: { weight: 20, patterns: ['urgent', 'immediately', 'trust me', 'authorized', 'official', 'asap'] },
  DESTRUCTIVE_ACTION: { weight: 35, patterns: ['delete all', 'format', 'wipe', 'destroy', 'purge', 'drop'] },
  HIGH_AMBIGUITY: { weight: 5, patterns: [] }
};

// Provider abstraction
class RiskProvider {
  analyze(command, intent) {
    throw new Error('analyze() not implemented');
  }
}

// Built-in rule-based provider (works offline, no API keys needed)
class RuleBasedProvider extends RiskProvider {
  analyze(command, intent) {
    const cmd = command.toLowerCase();
    const detectedCategories = [];
    let totalScore = 0;

    for (const [category, config] of Object.entries(RISK_CATEGORIES)) {
      const matched = config.patterns.some(p => cmd.includes(p));
      if (matched) {
        detectedCategories.push(category);
        totalScore += config.weight;
      }
    }

    // Intent-based scoring
    const intentScores = {
      'THREAT_SCAN': 10,
      'INTEGRITY_CHECK': 5,
      'COMPLIANCE_CHECK': 5,
      'DECISION_STRESS_TEST': 15,
      'RED_TEAM_SCENARIO': 25,
      'LOCKDOWN': 30,
      'CRITICAL_OVERRIDE': 40,
      'DESTRUCTIVE_ACTION': 50,
      'GENERAL_QUERY': 0
    };
    totalScore += intentScores[intent] || 0;

    // Cap at 100
    totalScore = Math.min(totalScore, 100);

    // Determine risk level — aligned to ENLIL spec bands
    // 0–24 LOW | 25–49 MEDIUM | 50–74 HIGH | 75–100 CRITICAL
    let riskLevel = 'LOW';
    if (totalScore >= 75) riskLevel = 'CRITICAL';
    else if (totalScore >= 50) riskLevel = 'HIGH';
    else if (totalScore >= 25) riskLevel = 'MEDIUM';

    // Determine primary risk category
    const riskCategory = detectedCategories.length > 0 ? detectedCategories[0] : 'NONE';

    // Reasoning
    let reasoning = `Analyzed command with ${detectedCategories.length} risk categories detected.`;
    if (detectedCategories.length > 0) {
      reasoning += ` Categories: ${detectedCategories.join(', ')}.`;
    }
    if (totalScore >= 50) {
      reasoning += ' This command requires elevated review.';
    }

    // Recommended action — aligned to risk bands
    let recommendedAction = 'PROCEED';
    if (totalScore >= 75) recommendedAction = 'BLOCK_AND_REVIEW';
    else if (totalScore >= 50) recommendedAction = 'REQUIRE_APPROVAL';
    else if (totalScore >= 25) recommendedAction = 'PROCEED_WITH_MONITORING';

    return {
      risk_score: totalScore,
      risk_level: riskLevel,
      risk_category: riskCategory,
      categories: detectedCategories,
      reasoning,
      recommended_action: recommendedAction,
      human_approval_required: totalScore >= 50,
      should_block: totalScore >= 75,
      confidence: detectedCategories.length > 0 ? Math.min(50 + detectedCategories.length * 10, 95) : 50,
      provider: 'rule-based'
    };
  }
}

// Stub for future LLM integration
class LLMProvider extends RiskProvider {
  analyze(command, intent) {
    // TODO: Connect to OpenAI / Anthropic / local model
    // Falls back to rule-based for now
    console.warn('[TITAN] LLM provider not configured, using rule-based fallback');
    return new RuleBasedProvider().analyze(command, intent);
  }
}

// Factory
function getProvider() {
  const providerType = process.env.TITAN_PROVIDER || 'rule-based';
  switch (providerType) {
    case 'llm': return new LLMProvider();
    default: return new RuleBasedProvider();
  }
}

const provider = getProvider();

function analyze(command, intent) {
  return provider.analyze(command, intent);
}

module.exports = { analyze, RuleBasedProvider, LLMProvider };
