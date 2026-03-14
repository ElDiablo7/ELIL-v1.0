/**
 * Training Module
 * Handles interactive lessons, simulations, and educational content
 */

const Training = (function () {
  'use strict';

  let trainingData = null;
  let currentLesson = null;
  let simulatorState = {
    active: false,
    currentStep: 0,
    score: 0,
    history: []
  };

  async function init() {
    console.log('Training module initializing...');
    try {
      const response = await fetch('./assets/data/training_index.json');
      trainingData = await response.json();
    } catch (e) {
      console.error('Failed to load training index:', e);
    }
  }

  async function render() {
    const console = document.getElementById('output-console');
    if (!console) return;

    if (!trainingData) {
      await init();
    }

    if (!trainingData) {
      console.innerHTML = '<div class="output-card posture-red"><div class="card-content">Error loading training data.</div></div>';
      return;
    }

    if (simulatorState.active) {
      renderSimulator(console);
      return;
    }

    if (currentLesson) {
      renderLesson(console);
      return;
    }

    renderIndex(console);
  }

  function renderIndex(container) {
    let html = `
      <div class="output-card">
        <div class="card-header">
          <span class="card-title">Training Index</span>
          <span>COMPREHENSIVE MODE</span>
        </div>
        <div class="card-content">
          <p>Welcome to the TITAN Tactical Training Suite. Select a module to begin.</p>
        </div>
      </div>
    `;

    for (const [category, items] of Object.entries(trainingData)) {
      const categoryTitle = category.replace(/_/g, ' ').toUpperCase();
      html += `
        <div class="status-section">
          <h3>${categoryTitle}</h3>
          <div class="training-grid">
      `;

      items.forEach((item, index) => {
        const difficultyClass = (item.difficulty || 'medium').toLowerCase();
        html += `
          <div class="training-card" onclick="Training.startLesson('${category}', ${index})">
            <div class="training-card-header">
              <span class="training-type">${item.type || 'LESSON'}</span>
              <span class="training-difficulty difficulty-${difficultyClass}">${item.difficulty || 'MEDIUM'}</span>
            </div>
            <div class="training-card-title">${item.title}</div>
            <div class="training-card-summary">${item.summary}</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  async function startLesson(category, index) {
    const item = trainingData[category][index];
    if (item.type === 'SIMULATION') {
      startSimulation(item.module_id || `${category}_${index}`);
    } else {
      await loadLesson(item.module_id || `${category}_${index}`, item);
    }
  }

  async function loadLesson(moduleId, indexItem) {
    try {
      // First try to load detailed JSON if module_id exists
      const response = await fetch(`./assets/data/training/${moduleId}.json`);
      if (response.ok) {
        currentLesson = await response.json();
      } else {
        // Fallback to basic info from index
        currentLesson = {
          ...indexItem,
          content: indexItem.summary + "\n\n(Detailed content for this module is being synchronized...)"
        };
      }
      render();
    } catch (e) {
      currentLesson = {
        title: indexItem.title,
        content: "Detailed training module offline. Please retry connection."
      };
      render();
    }
  }

  function renderLesson(container) {
    container.innerHTML = `
      <div class="output-card">
        <div class="card-header">
          <span class="card-title">${currentLesson.title}</span>
          <button class="demo-btn" onclick="Training.closeLesson()">BACK TO INDEX</button>
        </div>
        <div class="card-content lesson-content">
          ${formatLessonContent(currentLesson.content)}
        </div>
        ${currentLesson.quiz ? renderQuizPreview() : ''}
      </div>
    `;
  }

  function formatLessonContent(content) {
    if (!content) return '';
    // Simple markdown-ish formatting
    return content
      .split('\n\n')
      .map(p => {
        if (p.startsWith('# ')) return `<h3>${p.substring(2)}</h3>`;
        if (p.startsWith('## ')) return `<h4>${p.substring(3)}</h4>`;
        if (p.startsWith('- ')) return `<ul>${p.split('\n').map(li => `<li>${li.substring(2)}</li>`).join('')}</ul>`;
        return `<p>${p}</p>`;
      })
      .join('');
  }

  function closeLesson() {
    currentLesson = null;
    render();
  }

  // Simulator Logic
  async function startSimulation(moduleId) {
    try {
      const response = await fetch(`./assets/data/training/${moduleId}.json`);
      const simData = await response.json();
      
      simulatorState = {
        active: true,
        data: simData,
        currentStep: 0,
        score: 0,
        history: []
      };
      render();
    } catch (e) {
      console.error('Failed to start simulation:', e);
    }
  }

  function renderSimulator(container) {
    const step = simulatorState.data.steps[simulatorState.currentStep];
    const progress = Math.round(((simulatorState.currentStep) / simulatorState.data.steps.length) * 100);

    container.innerHTML = `
      <div class="output-card posture-amber">
        <div class="card-header">
          <span class="card-title">SIMULATOR: ${simulatorState.data.title}</span>
          <span class="sim-progress">STEP ${simulatorState.currentStep + 1}/${simulatorState.data.steps.length}</span>
        </div>
        <div class="sim-progress-bar">
          <div class="sim-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="card-content sim-content">
          <div class="sim-scenario">
            <p><strong>SCENARIO:</strong> ${step.scenario}</p>
          </div>
          <div class="sim-options">
            ${step.options.map((opt, i) => `
              <button class="route-btn sim-opt-btn" onclick="Training.processSimChoice(${i})">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="card-header sim-footer" style="padding-top: 20px;">
          <button class="demo-btn" onclick="Training.abortSimulation()">ABORT SIMULATION</button>
          <span>SCORE: ${simulatorState.score}</span>
        </div>
      </div>
    `;
  }

  function processSimChoice(index) {
    const step = simulatorState.data.steps[simulatorState.currentStep];
    const choice = step.options[index];
    
    simulatorState.score += choice.score || 0;
    simulatorState.history.push({
      step: simulatorState.currentStep,
      choice: choice.text,
      outcome: choice.outcome
    });

    if (simulatorState.currentStep + 1 < simulatorState.data.steps.length) {
      simulatorState.currentStep++;
      render();
    } else {
      endSimulation();
    }
  }

  function endSimulation() {
    const console = document.getElementById('output-console');
    const totalSteps = simulatorState.data.steps.length;
    const maxScore = totalSteps * 10; // Assuming 10 is max per step
    const performance = Math.round((simulatorState.score / maxScore) * 100);

    let rank = 'F';
    let posture = 'RED';
    if (performance >= 90) { rank = 'S'; posture = 'GREEN'; }
    else if (performance >= 75) { rank = 'A'; posture = 'GREEN'; }
    else if (performance >= 60) { rank = 'B'; posture = 'AMBER'; }
    else if (performance >= 40) { rank = 'C'; posture = 'AMBER'; }

    console.innerHTML = `
      <div class="output-card posture-${posture.toLowerCase()}">
        <div class="card-header">
          <span class="card-title">SIMULATION COMPLETE</span>
        </div>
        <div class="card-content sim-results">
          <h3>TACTICAL EVALUATION: RANK ${rank}</h3>
          <p><strong>Total Score:</strong> ${simulatorState.score}</p>
          <p><strong>Efficiency:</strong> ${performance}%</p>
          <div class="sim-summary">
            ${simulatorState.data.success_message || 'Simulation completed successfully.'}
          </div>
          <button class="route-btn" style="margin-top: 20px" onclick="Training.abortSimulation()">RETURN TO INDEX</button>
        </div>
      </div>
    `;
    
    simulatorState.history = []; // Reset but keep active=true briefly to stay in training tab
  }

  function abortSimulation() {
    simulatorState.active = false;
    render();
  }

  function renderQuizPreview() {
    return `
      <div class="quiz-preview">
        <span>Module includes Tactical Quiz assessment.</span>
      </div>
    `;
  }

  return {
    init,
    render,
    startLesson,
    closeLesson,
    processSimChoice,
    abortSimulation
  };
})();
