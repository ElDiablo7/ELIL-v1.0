/**
 * GRACE-X Voice Core (TITAN Integration)
 * Handles Wake Word, Speech-to-Text, and Tactical TTS
 */

const GraceX_Voice = (function () {
  'use strict';

  let isEnabled = false;
  let isListening = false;
  let isActiveMode = false;
  let SpeechRecognition = null;
  let wakeWordRecognizer = null;
  let commandRecognizer = null;
  
  // LOCKED GRACE DEFAULTS (No Drift)
  const GRACE_LOCKED_RATE = 1.10;
  const GRACE_LOCKED_PITCH = 1.15;
  const GRACE_LOCKED_VOICE_NAME = 'Google UK English Female';
  
  const CONFIG = {
    wakeWords: ['ok grace', 'okay grace', 'hey grace', 'hey gracie', 'ok gracie'],
    language: 'en-GB',
    activeListenDuration: 10000,
    silenceTimeout: 5000,
    backgroundListening: true
  };

  function init() {
    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[GRACEX VOICE] Speech recognition not supported.');
      return;
    }

    if (!window.isSecureContext) {
      console.warn('[GRACEX VOICE] Secure context required for mic access.');
      return;
    }

    console.log('[GRACEX VOICE] Core Initialized.');
  }

  // --- TTS ENGINE (LOCKED) ---
  
  async function speak(text, tone = 'default') {
    if (!window.speechSynthesis) return Promise.resolve();
    
    // Stop current speech
    window.speechSynthesis.cancel();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Auto-select preferred voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name === GRACE_LOCKED_VOICE_NAME) || 
                        voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Female')) ||
                        voices.find(v => v.lang.startsWith('en-GB')) ||
                        voices[0];
      
      utterance.voice = preferred;
      utterance.rate = GRACE_LOCKED_RATE;
      utterance.pitch = GRACE_LOCKED_PITCH;
      utterance.lang = 'en-GB';

      // Tone adjustments
      if (tone === 'firm') utterance.rate = 1.0;
      if (tone === 'urgent') { utterance.rate = 1.2; utterance.pitch = 1.25; }

      utterance.onend = () => { resolve(); };
      utterance.onerror = (e) => { console.error('[GRACEX TTS] Error:', e); resolve(); };

      window.speechSynthesis.speak(utterance);
    });
  }

  // --- STT ENGINE (WAKE WORD + COMMAND) ---

  function startWakeWordListener() {
    if (wakeWordRecognizer) try { wakeWordRecognizer.stop(); } catch(e) {}
    if (isActiveMode) return;

    wakeWordRecognizer = new SpeechRecognition();
    wakeWordRecognizer.continuous = true;
    wakeWordRecognizer.interimResults = true;
    wakeWordRecognizer.lang = CONFIG.language;

    wakeWordRecognizer.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const transcript = (event.results[i][0].transcript || '').toLowerCase().trim();
        
        const detected = CONFIG.wakeWords.some(w => transcript.includes(w));
        if (detected && !isActiveMode) {
          console.log('[GRACEX VOICE] Wake word detected.');
          try { wakeWordRecognizer.stop(); } catch(e) {}
          
          speak("Acknowledged. I'm listening.").then(startActiveListening);
        }
      }
    };

    wakeWordRecognizer.onend = () => {
      if (CONFIG.backgroundListening && !isActiveMode) {
        setTimeout(startWakeWordListener, 500);
      }
    };

    try {
      wakeWordRecognizer.start();
      isListening = true;
      updateHubUI('idle');
    } catch(e) {
      console.warn('[GRACEX VOICE] Failed to start wake word listener:', e);
    }
  }

  function startActiveListening() {
    isActiveMode = true;
    updateHubUI('listening');

    if (commandRecognizer) try { commandRecognizer.stop(); } catch(e) {}

    commandRecognizer = new SpeechRecognition();
    commandRecognizer.lang = CONFIG.language;
    commandRecognizer.interimResults = true;

    let finalTranscript = '';

    commandRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += text;
        else interim += text;
      }
      updateTranscriptionUI((finalTranscript + interim).trim());
    };

    commandRecognizer.onend = () => {
      if (finalTranscript.trim()) {
        processVoiceCommand(finalTranscript.trim());
      } else {
        isActiveMode = false;
        startWakeWordListener();
        updateHubUI('idle');
      }
    };

    commandRecognizer.start();
    
    // Safety timeout
    setTimeout(() => {
      if (isActiveMode) try { commandRecognizer.stop(); } catch(e) {}
    }, CONFIG.activeListenDuration);
  }

  async function processVoiceCommand(command) {
    isActiveMode = false;
    updateHubUI('processing');
    console.log('[GRACEX VOICE] Processing:', command);

    // Route to Sentinel/Titan
    if (window.Sentinel && typeof window.Sentinel.routeCommand === 'function') {
      const response = await window.Sentinel.routeCommand(command);
      if (response && response.message) {
        await speak(response.message);
      } else if (typeof response === 'string') {
        await speak(response);
      }
    } else {
      await speak("Command received. Sentinel routing offline.");
    }

    startWakeWordListener();
    updateHubUI('idle');
    setTimeout(() => updateTranscriptionUI(''), 3000);
  }

  // --- UI INTEGRATION ---

  function updateHubUI(state) {
    const hub = document.getElementById('grace-hub');
    if (!hub) return;
    hub.className = `grace-hub grace-hub-${state}`;
  }

  function updateTranscriptionUI(text) {
    const el = document.getElementById('voice-transcription');
    if (!el) return;
    el.textContent = text;
    el.className = text ? 'voice-transcription active' : 'voice-transcription';
  }

  function toggle() {
    if (isListening || isActiveMode) {
      stop();
    } else {
      start();
    }
  }

  function start() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        CONFIG.backgroundListening = true;
        startWakeWordListener();
        isEnabled = true;
        if (window.Logs) window.Logs.append({ action: 'VOICE_ASSISTANT_ENABLED', actor_role: 'OPERATOR' });
      })
      .catch(err => {
        console.error('[GRACEX VOICE] Access denied:', err);
      });
  }

  function stop() {
    CONFIG.backgroundListening = false;
    if (wakeWordRecognizer) try { wakeWordRecognizer.stop(); } catch(e) {}
    if (commandRecognizer) try { commandRecognizer.stop(); } catch(e) {}
    isListening = false;
    isActiveMode = false;
    isEnabled = false;
    updateHubUI('disabled');
  }

  return {
    init,
    start,
    stop,
    toggle,
    isActive: () => isActiveMode,
    isEnabled: () => isEnabled,
    speak
  };
})();
