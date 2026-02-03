/**
 * TITAN™ - Tactical Internal Threat Assessment Nucleus
 * TITAN_INTERNAL_ONLY - Cannot be invoked directly by user
 * Only Sentinel can invoke TITAN
 * Terse, structured, procedural output - no chatty responses
 */

const Titan = (function() {
  'use strict';

  let initialized = false;
  let threatTaxonomy = {};
  let redTeamScenarios = {};

  // Initialize TITAN
  function init() {
    if (initialized) return;
    loadThreatTaxonomy();
    loadRedTeamScenarios();
    initialized = true;
  }

  // Load threat taxonomy
  async function loadThreatTaxonomy() {
    try {
      const response = await fetch('./assets/data/threat_taxonomy.json');
      if (response.ok) {
        threatTaxonomy = await response.json();
      }
    } catch (e) {
      console.error('Failed to load threat taxonomy');
    }
  }

  // Load red team scenarios
  async function loadRedTeamScenarios() {
    try {
      const response = await fetch('./assets/data/redteam_scenarios.json');
      if (response.ok) {
        const data = await response.json();
        redTeamScenarios = data.scenarios || [];
      }
    } catch (e) {
      console.error('Failed to load red team scenarios');
    }
  }

  // Core Engine

  function analyze(taskPacket) {
    // TITAN_INTERNAL_ONLY - This should only be called by Sentinel
    if (!taskPacket || typeof taskPacket !== 'object') {
      return formatResult({
        summary: 'Invalid task packet',
        findings: [],
        risk_score: 0
      });
    }

    const normalized = normalize(taskPacket);
    const findings = [];

    // Threat scan
    const threatFindings = threatScan(normalized);
    findings.push(...threatFindings);

    // Attack surface mapping
    const surfaceFindings = attackSurfaceMap(normalized.context || {});
    findings.push(...surfaceFindings);

    // Adversarial reasoning
    const adversarialFindings = adversarialReasoning(normalized);
    findings.push(...adversarialFindings);

    // Deception detection
    const deceptionFindings = deceptionDetection(normalized);
    findings.push(...deceptionFindings);

    // Compliance check
    const complianceFindings = complianceCheck(normalized);
    findings.push(...complianceFindings);

    // Data handling rules
    const dataFindings = dataHandlingRules(normalized);
    findings.push(...dataFindings);

    // Calculate risk score
    const riskScore = calculateRiskFromFindings(findings);

    // Generate recommendations
    const recommendedControls = recommendControls(findings);
    const riskMitigation = riskMitigationPlan(findings);
    const escalation = escalationMatrix(findings);

    return formatResult({
      summary: `Analysis complete. ${findings.length} findings.`,
      findings,
      risk_score: riskScore,
      recommended_controls: recommendedControls,
      risk_mitigation: riskMitigation,
      escalation,
      confidence_score: confidenceScore(findings),
      classification: classification(findings)
    });
  }

  function normalize(taskPacket) {
    return {
      command: String(taskPacket.command || '').trim(),
      intent: taskPacket.intent || 'UNKNOWN',
      risk_score: taskPacket.risk_score || 0,
      context: taskPacket.context || {},
      timestamp: taskPacket.timestamp || Date.now(),
      actor_role: taskPacket.actor_role || 'UNKNOWN'
    };
  }

  function threatScan(taskPacket) {
    const findings = [];
    const command = (taskPacket.command || '').toLowerCase();

    // Check against threat taxonomy
    for (const [category, data] of Object.entries(threatTaxonomy)) {
      for (const indicator of data.common_indicators || []) {
        if (command.includes(indicator.toLowerCase().replace(/_/g, ' '))) {
          findings.push({
            type: 'THREAT_INDICATOR',
            category,
            severity: data.severity_baseline,
            indicator,
            description: data.description,
            controls: data.controls
          });
        }
      }
    }

    // Prompt injection patterns
    const injectionPatterns = [
      'ignore previous', 'forget', 'override', 'system prompt', 'role play',
      'jailbreak', 'bypass', 'disregard', 'act as', 'pretend'
    ];

    injectionPatterns.forEach(pattern => {
      if (command.includes(pattern)) {
        findings.push({
          type: 'PROMPT_INJECTION_ATTEMPT',
          category: 'prompt_injection',
          severity: 'CRITICAL',
          pattern,
          description: 'Potential prompt injection or instruction hijacking attempt detected'
        });
      }
    });

    return findings;
  }

  function attackSurfaceMap(context) {
    const findings = [];
    const surfaces = [];

    // Identify attack surfaces from context
    if (context.external_request) {
      surfaces.push('EXTERNAL_INTERFACE');
      findings.push({
        type: 'ATTACK_SURFACE',
        surface: 'EXTERNAL_INTERFACE',
        risk: 'HIGH',
        description: 'External interface exposed'
      });
    }

    if (context.sensitive_data) {
      surfaces.push('DATA_ACCESS');
      findings.push({
        type: 'ATTACK_SURFACE',
        surface: 'DATA_ACCESS',
        risk: 'HIGH',
        description: 'Sensitive data access point identified'
      });
    }

    if (context.admin_function) {
      surfaces.push('PRIVILEGED_OPERATION');
      findings.push({
        type: 'ATTACK_SURFACE',
        surface: 'PRIVILEGED_OPERATION',
        risk: 'CRITICAL',
        description: 'Privileged operation surface identified'
      });
    }

    return findings;
  }

  function adversarialReasoning(taskPacket) {
    const findings = [];
    const command = (taskPacket.command || '').toLowerCase();

    // Red-team style reasoning: what could go wrong?
    const adversarialScenarios = [
      {
        pattern: 'delete',
        risk: 'DATA_LOSS',
        description: 'Deletion operation could result in data loss'
      },
      {
        pattern: 'modify',
        risk: 'INTEGRITY_COMPROMISE',
        description: 'Modification could compromise system integrity'
      },
      {
        pattern: 'export',
        risk: 'DATA_EXFILTRATION',
        description: 'Export operation could enable data exfiltration'
      },
      {
        pattern: 'override',
        risk: 'CONTROL_BYPASS',
        description: 'Override could bypass security controls'
      }
    ];

    adversarialScenarios.forEach(scenario => {
      if (command.includes(scenario.pattern)) {
        findings.push({
          type: 'ADVERSARIAL_RISK',
          risk_type: scenario.risk,
          severity: 'HIGH',
          description: scenario.description
        });
      }
    });

    return findings;
  }

  function deceptionDetection(signals) {
    const findings = [];
    const command = (signals.command || '').toLowerCase();

    // Basic deception heuristics
    const deceptionPatterns = [
      { pattern: 'urgent', type: 'URGENCY_MANIPULATION' },
      { pattern: 'immediately', type: 'URGENCY_MANIPULATION' },
      { pattern: 'asap', type: 'URGENCY_MANIPULATION' },
      { pattern: 'trust me', type: 'TRUST_EXPLOITATION' },
      { pattern: 'authorized', type: 'AUTHORITY_CLAIM' },
      { pattern: 'official', type: 'AUTHORITY_CLAIM' }
    ];

    deceptionPatterns.forEach(({ pattern, type }) => {
      if (command.includes(pattern)) {
        findings.push({
          type: 'DECEPTION_INDICATOR',
          deception_type: type,
          severity: 'MEDIUM',
          description: `Potential deception pattern detected: ${type}`
        });
      }
    });

    return findings;
  }

  // Integrity & Security

  function systemIntegrityCheck() {
    const findings = [];

    // Check log integrity
    const logIntegrity = logIntegrityCheck();
    if (!logIntegrity.valid) {
      findings.push({
        type: 'INTEGRITY_VIOLATION',
        component: 'LOGS',
        severity: 'CRITICAL',
        description: 'Log integrity check failed'
      });
    }

    // Check policy drift
    const policyDrift = policyDriftCheck();
    if (policyDrift.drift_detected) {
      findings.push({
        type: 'POLICY_DRIFT',
        severity: 'HIGH',
        description: 'Policy configuration drift detected'
      });
    }

    // Supply chain check
    const supplyChain = supplyChainCheck();
    if (supplyChain.warnings.length > 0) {
      findings.push({
        type: 'SUPPLY_CHAIN_WARNING',
        severity: 'MEDIUM',
        description: 'Supply chain warnings detected',
        warnings: supplyChain.warnings
      });
    }

    return findings;
  }

  function permissionDriftCheck() {
    // Check for permission changes
    const storedPermissions = Utils.Storage.get('permission_baseline', {});
    const currentPermissions = {
      role: Sentinel.getCurrentRole(),
      authenticated: Sentinel.isAuthenticated()
    };

    const drift = JSON.stringify(storedPermissions) !== JSON.stringify(currentPermissions);

    return {
      drift_detected: drift,
      previous: storedPermissions,
      current: currentPermissions
    };
  }

  function policyDriftCheck() {
    const currentPack = Policy.getCurrentPolicyPack();
    const storedPack = Utils.Storage.get('policy_pack_baseline', null);

    return {
      drift_detected: storedPack && storedPack.name !== currentPack?.name,
      previous: storedPack,
      current: currentPack?.name || null
    };
  }

  function logIntegrityCheck() {
    return {
      valid: Logs.verify(),
      entry_count: Logs.getAll().length
    };
  }

  function supplyChainCheck() {
    const warnings = [];

    // Check for external library usage (should be dependency-free)
    if (typeof fetch !== 'undefined') {
      // fetch is native, but we're using it for local JSON only
    }

    // Warn if external connectors detected (stubbed)
    const config = Utils.Storage.get('config', {});
    if (config.external_connectors_enabled) {
      warnings.push('External connectors enabled - offline-first violation');
    }

    return { warnings, dependency_free: warnings.length === 0 };
  }

  // Compliance & Constraints

  function complianceCheck(taskPacket) {
    const findings = [];
    const policyPack = Policy.getCurrentPolicyPack();

    if (!policyPack) {
      findings.push({
        type: 'COMPLIANCE_VIOLATION',
        severity: 'HIGH',
        description: 'No policy pack loaded'
      });
      return findings;
    }

    // Check action compliance
    const intent = taskPacket.intent || 'UNKNOWN';
    const actionAllowed = Policy.isActionAllowed(intent);

    if (!actionAllowed) {
      findings.push({
        type: 'COMPLIANCE_VIOLATION',
        severity: 'HIGH',
        description: `Action '${intent}' not allowed by current policy`
      });
    }

    return findings;
  }

  function dataHandlingRules(taskPacket) {
    const findings = [];
    const command = String(taskPacket.command || '').toLowerCase();

    // PII patterns
    const piiPatterns = ['ssn', 'social security', 'credit card', 'passport', 'driver license'];
    piiPatterns.forEach(pattern => {
      if (command.includes(pattern)) {
        findings.push({
          type: 'PII_DETECTED',
          severity: 'HIGH',
          description: 'Potential PII in command'
        });
      }
    });

    // Secret patterns
    const secretPatterns = ['password', 'api key', 'token', 'secret', 'credential'];
    secretPatterns.forEach(pattern => {
      if (command.includes(pattern)) {
        findings.push({
          type: 'SECRET_DETECTED',
          severity: 'CRITICAL',
          description: 'Potential secret in command'
        });
      }
    });

    return findings;
  }

  function safeResponseShape(result) {
    // Minimal necessary disclosure
    const safe = {
      summary: result.summary || 'Analysis complete',
      risk_score: result.risk_score || 0,
      findings_count: result.findings?.length || 0
    };

    // Only include non-sensitive findings
    if (result.findings) {
      safe.findings = result.findings
        .filter(f => f.severity !== 'CRITICAL' || f.type !== 'SECRET_DETECTED')
        .slice(0, 5); // Limit to 5 findings
    }

    return safe;
  }

  // Decision & Stress Testing

  function decisionStressTest(plan) {
    const findings = [];

    // Failure modes
    const failureModes = [
      'Network failure',
      'Authentication failure',
      'Policy violation',
      'Rate limit exceeded',
      'Resource exhaustion'
    ];

    failureModes.forEach(mode => {
      findings.push({
        type: 'STRESS_TEST',
        failure_mode: mode,
        severity: 'MEDIUM',
        description: `Stress test: ${mode} scenario`
      });
    });

    // Edge cases
    findings.push({
      type: 'EDGE_CASE',
      severity: 'LOW',
      description: 'Edge case: Empty input handling'
    });

    findings.push({
      type: 'EDGE_CASE',
      severity: 'LOW',
      description: 'Edge case: Maximum input length'
    });

    return findings;
  }

  function riskMitigationPlan(findings) {
    const plan = [];

    findings.forEach(finding => {
      if (finding.severity === 'CRITICAL' || finding.severity === 'HIGH') {
        plan.push({
          finding_type: finding.type,
          mitigation: `Immediate review required for ${finding.type}`,
          priority: 'HIGH'
        });
      }
    });

    return plan;
  }

  function recommendControls(findings) {
    const controls = [];

    findings.forEach(finding => {
      if (finding.controls && Array.isArray(finding.controls)) {
        controls.push(...finding.controls);
      }
    });

    // Add default controls
    controls.push('Enhanced monitoring');
    controls.push('Access review');
    controls.push('Audit logging');

    // Remove duplicates
    return [...new Set(controls)];
  }

  function escalationMatrix(findings) {
    const matrix = [];

    findings.forEach(finding => {
      if (finding.severity === 'CRITICAL') {
        matrix.push({
          finding_type: finding.type,
          escalate_to: 'ADMIN',
          timeframe: 'IMMEDIATE',
          condition: 'CRITICAL severity'
        });
      } else if (finding.severity === 'HIGH') {
        matrix.push({
          finding_type: finding.type,
          escalate_to: 'OPERATOR',
          timeframe: 'WITHIN_1_HOUR',
          condition: 'HIGH severity'
        });
      }
    });

    return matrix;
  }

  // Red Team & Scenarios

  function runRedTeamScenario(id) {
    const scenario = redTeamScenarios.find(s => s.id === id);
    if (!scenario) {
      return {
        summary: 'Scenario not found',
        findings: []
      };
    }

    const findings = [
      {
        type: 'RED_TEAM_SCENARIO',
        scenario_id: id,
        scenario_name: scenario.name,
        attacker_goal: scenario.attacker_goal,
        severity: 'HIGH',
        description: `Red team scenario: ${scenario.name}`
      }
    ];

    // Generate attack paths
    const attackPaths = generateAttackPaths({
      goal: scenario.attacker_goal,
      mistake_pattern: scenario.operator_mistake_pattern
    });
    findings.push(...attackPaths);

    // Map countermeasures
    const countermeasures = countermeasureLibrary(scenario.attacker_goal);
    findings.push({
      type: 'COUNTERMEASURES',
      controls: countermeasures
    });

    return formatResult({
      summary: `Red team scenario ${id} executed`,
      findings,
      recommended_controls: scenario.recommended_controls || []
    });
  }

  function generateAttackPaths(targetProfile) {
    const paths = [];

    if (targetProfile.goal) {
      paths.push({
        type: 'ATTACK_PATH',
        step: 1,
        description: `Initial access via ${targetProfile.mistake_pattern || 'social engineering'}`,
        severity: 'HIGH'
      });

      paths.push({
        type: 'ATTACK_PATH',
        step: 2,
        description: 'Establish persistence',
        severity: 'MEDIUM'
      });

      paths.push({
        type: 'ATTACK_PATH',
        step: 3,
        description: `Achieve goal: ${targetProfile.goal}`,
        severity: 'HIGH'
      });
    }

    return paths;
  }

  function countermeasureLibrary(match) {
    // Map threats to controls from taxonomy
    const controls = [];

    for (const [category, data] of Object.entries(threatTaxonomy)) {
      if (match.toLowerCase().includes(category.toLowerCase()) || 
          data.description.toLowerCase().includes(match.toLowerCase())) {
        controls.push(...(data.controls || []));
      }
    }

    return [...new Set(controls)];
  }

  // Output

  function formatResult(data) {
    return {
      summary: data.summary || 'Analysis complete',
      risk_score: data.risk_score || 0,
      posture: determinePosture(data.risk_score),
      findings: data.findings || [],
      recommended_controls: data.recommended_controls || [],
      escalation: data.escalation || [],
      classification: data.classification || 'TITAN_INTERNAL_ONLY',
      confidence_score: data.confidence_score || confidenceScore(data.findings || []),
      timestamp: Date.now()
    };
  }

  function confidenceScore(findings) {
    if (!findings || findings.length === 0) return 50;

    let score = 50;
    findings.forEach(f => {
      if (f.severity === 'CRITICAL') score += 10;
      else if (f.severity === 'HIGH') score += 5;
      else if (f.severity === 'MEDIUM') score += 2;
    });

    return Math.min(Math.max(score, 0), 100);
  }

  function classification(findings) {
    // Default TITAN_INTERNAL_ONLY
    return 'TITAN_INTERNAL_ONLY';
  }

  function determinePosture(riskScore) {
    if (riskScore >= 90) return 'BLACK';
    if (riskScore >= 60) return 'RED';
    if (riskScore >= 30) return 'AMBER';
    return 'GREEN';
  }

  // Initialize on load
  init();

  // Public API
  return {
    init,
    analyze,
    normalize,
    threatScan,
    attackSurfaceMap,
    adversarialReasoning,
    deceptionDetection,
    systemIntegrityCheck,
    permissionDriftCheck,
    policyDriftCheck,
    logIntegrityCheck,
    supplyChainCheck,
    complianceCheck,
    dataHandlingRules,
    safeResponseShape,
    decisionStressTest,
    riskMitigationPlan,
    recommendControls,
    escalationMatrix,
    runRedTeamScenario,
    generateAttackPaths,
    countermeasureLibrary,
    formatResult,
    confidenceScore,
    classification
  };
})();
