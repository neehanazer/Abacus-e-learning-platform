"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  Award, 
  Flame, 
  Timer, 
  Sliders, 
  Eye, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  GraduationCap
} from "lucide-react";
import "@/styles/virtual-abacus.css";

export default function VirtualAbacus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function setupAbacus() {
      try {
        const { initAbacusApp } = await import("@/lib/virtual-abacus/app.js");
        if (mounted) {
          appInstanceRef.current = initAbacusApp();
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to initialize Virtual Abacus:", err);
      }
    }

    setupAbacus();

    return () => {
      mounted = false;
      // Clean up any timers if needed
      if (appInstanceRef.current?.practice) {
        try {
          if (appInstanceRef.current.practice.challengeTimerInterval) {
            clearInterval(appInstanceRef.current.practice.challengeTimerInterval);
          }
          if (appInstanceRef.current.practice.quizTimerInterval) {
            clearInterval(appInstanceRef.current.practice.quizTimerInterval);
          }
          if (appInstanceRef.current.practice.anzanInterval) {
            clearInterval(appInstanceRef.current.practice.anzanInterval);
          }
        } catch {
          // ignore cleanup issues
        }
      }
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FAFAFE] via-[#F3F0FF]/40 to-[#F0F4FF] py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Child-friendly MindBeads AI Top Banner */}
        <div className="mb-6 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner shadow-white/30">
                🧮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-sans shadow-sm">
                    Interactive Soroban
                  </span>
                  <span className="text-xs text-purple-200 font-medium hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Competition Ready
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                  Virtual Soroban Abacus
                </h1>
                <p className="text-sm text-purple-100/90 font-medium">
                  5 Reckoner unit dots, real-time math HUD, tactile bead physics, and 4 fun training modes!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                href="/learning/practice"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-bold transition-all border border-white/20"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                Practice Mode
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-800 hover:bg-amber-50 text-xs font-bold transition-all shadow-md"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Virtual Abacus Main Host Container */}
        <div ref={containerRef} className="virtual-abacus-app" data-theme="light-classic">
          <div className="app-container">
            
            {/* App Top Navigation Header */}
            <header className="app-header">
              <div className="header-brand">
                <div className="brand-logo-icon">🧮</div>
                <div className="brand-titles">
                  <h2 className="main-title">Virtual Soroban Abacus</h2>
                  <p className="sub-title">Authentic Competition Abacus with 5 Reckoner Unit Dots</p>
                </div>
              </div>

              {/* Header Quick Action Bar */}
              <div className="header-actions">
                <div className="control-group">
                  <label htmlFor="rod-count-select" className="ctrl-label">Rods:</label>
                  <select id="rod-count-select" className="styled-select" aria-label="Rod Count" defaultValue="17">
                    <option value="17">17 Rods (Competition)</option>
                    <option value="15">15 Rods (Expanded)</option>
                    <option value="13">13 Rods (Standard)</option>
                  </select>
                </div>

                <div className="control-group theme-ctrl">
                  <label htmlFor="theme-select" className="ctrl-label">Theme:</label>
                  <select id="theme-select" className="styled-select" aria-label="Abacus Theme" defaultValue="light-classic">
                    <option value="light-classic">🪵 Classic Wood</option>
                    <option value="light-studio">💎 Silver Studio</option>
                    <option value="light-rainbow">🌈 Rainbow Kids</option>
                    <option value="competition">🥋 Tournament Dark</option>
                    <option value="dark-cyber">⚡ Cyber Neon</option>
                  </select>
                </div>

                <div className="control-group audio-ctrls">
                  <button id="sound-toggle-btn" className="icon-text-btn" title="Toggle Sound">
                    🔊 <span className="btn-text">Sound ON</span>
                  </button>
                  <input type="range" id="sound-volume-slider" min="0" max="1" step="0.05" defaultValue="0.7" title="Audio Volume" />
                </div>

                <button id="open-intro-btn" className="guide-trigger-btn intro-trigger-btn" title="Soroban Introduction & Anatomy">
                  <span className="btn-icon">💡</span> <span className="btn-text">Introduction</span>
                </button>
                <button id="open-guide-btn" className="guide-trigger-btn" title="How to Read the Abacus">
                  <span className="btn-icon">📖</span> <span className="btn-text">Guide</span>
                </button>
              </div>
            </header>

            {/* Mode Navigation Ribbon */}
            <nav className="mode-ribbon" aria-label="Abacus Modes">
              <button className="mode-tab active" data-mode="free">
                <span className="tab-icon">✨</span> Free Play / Calculator
              </button>
              <button className="mode-tab" data-mode="challenge-set">
                <span className="tab-icon">🎯</span> &quot;Set Number&quot; Challenge
              </button>
              <button className="mode-tab" data-mode="quiz-read">
                <span className="tab-icon">👁️</span> &quot;Read Abacus&quot; Quiz
              </button>
              <button className="mode-tab" data-mode="flash-anzan">
                <span className="tab-icon">⚡</span> Flash Anzan (Mental Math)
              </button>
            </nav>

            {/* Dynamic Mode Panels */}
            <section id="mode-panels-area" className="mode-panels-area">
              
              {/* Mode 1: Free Play Control Strip */}
              <div id="free-play-panel" className="mode-panel active-panel">
                <div className="free-play-toolbar">
                  <div className="tool-section direct-input-group">
                    <span className="tool-label-badge">JUMP TO NUMBER</span>
                    <div className="input-with-btn">
                      <input type="number" id="direct-num-input" placeholder="e.g. 3450" min="0" />
                      <button id="direct-num-set-btn" className="action-btn-primary sm">Set Beads</button>
                    </div>
                  </div>

                  <div className="tool-section quick-presets-group">
                    <span className="tool-label-badge">QUICK PRESETS</span>
                    <div className="preset-chips">
                      <button type="button" className="preset-chip" data-val="0">0</button>
                      <button type="button" className="preset-chip" data-val="5">5</button>
                      <button type="button" className="preset-chip" data-val="25">25</button>
                      <button type="button" className="preset-chip" data-val="100">100</button>
                      <button type="button" className="preset-chip" data-val="1234">1,234</button>
                    </div>
                  </div>

                  <div className="tool-section view-toggles-group">
                    <span className="tool-label-badge">DISPLAY OPTIONS</span>
                    <div className="toggle-chips">
                      <label className="toggle-chip" title="Show place values above rods">
                        <input type="checkbox" id="toggle-place-labels" defaultChecked />
                        <span className="chip-content"><span className="chip-icon">🏷️</span> Place Names</span>
                      </label>
                      <label className="toggle-chip" title="Show digits 0-9 under rods">
                        <input type="checkbox" id="toggle-digit-labels" defaultChecked />
                        <span className="chip-content"><span className="chip-icon">🔢</span> Rod Digits</span>
                      </label>
                      <label className="toggle-chip" title="Show 5 and 1 labels on beads">
                        <input type="checkbox" id="toggle-bead-tooltips" />
                        <span className="chip-content"><span className="chip-icon">💡</span> Bead Values</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode 2: "Set Number" Challenge Panel */}
              <div id="challenge-set-panel" className="mode-panel hidden">
                <div className="panel-card-inner">
                  <div className="panel-header-strip">
                    <div className="difficulty-block">
                      <span className="control-label-badge">DIFFICULTY</span>
                      <div className="level-btn-group" id="challenge-level-btns">
                        <button className="level-btn" data-level="1">1-Digit (1-9)</button>
                        <button className="level-btn active" data-level="2">2-Digit (10-99)</button>
                        <button className="level-btn" data-level="3">3-Digit (100-999)</button>
                        <button className="level-btn" data-level="4">4-Digit (1000+)</button>
                        <button className="level-btn" data-level="5">Decimals (.1)</button>
                      </div>
                    </div>

                    <div className="stats-hub">
                      <div className="stat-pill"><span className="stat-icon">🏆</span><span className="stat-lbl">SCORE:</span> <span id="challenge-score" className="stat-num">0</span></div>
                      <div className="stat-pill"><span className="stat-icon">🔥</span><span className="stat-lbl">STREAK:</span> <span id="challenge-streak" className="stat-num">0</span></div>
                      <div className="stat-pill"><span className="stat-icon">⏱️</span><span className="stat-lbl">TIMER:</span> <span id="challenge-timer" className="stat-num">0s</span></div>
                    </div>
                  </div>

                  <div className="challenge-stage-row">
                    <div className="target-display-card">
                      <span className="target-sublabel">🎯 TARGET TO MAKE</span>
                      <div className="target-value-container">
                        <span id="challenge-target-val" className="target-huge-text">---</span>
                      </div>
                    </div>

                    <div className="feedback-col">
                      <div id="challenge-feedback" className="practice-feedback info">
                        Move beads on the abacus to match the target number!
                      </div>
                    </div>

                    <div className="challenge-actions-group">
                      <button id="challenge-check-btn" className="action-btn-primary">
                        <span className="btn-icon">✨</span> Check Beads
                      </button>
                      <button id="challenge-hint-btn" className="action-btn-secondary">
                        <span className="btn-icon">💡</span> Hint
                      </button>
                      <button id="challenge-skip-btn" className="action-btn-secondary">
                        <span className="btn-icon">⏭️</span> Skip
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode 3: "Read Abacus" Quiz Panel */}
              <div id="quiz-read-panel" className="mode-panel hidden">
                <div className="panel-card-inner">
                  <div className="panel-header-strip">
                    <div className="difficulty-block">
                      <span className="control-label-badge">DIFFICULTY</span>
                      <div className="level-btn-group" id="quiz-level-btns">
                        <button className="level-btn" data-level="1">1-Digit (1-9)</button>
                        <button className="level-btn active" data-level="2">2-Digit (10-99)</button>
                        <button className="level-btn" data-level="3">3-Digit (100-999)</button>
                        <button className="level-btn" data-level="4">4-Digit (1000+)</button>
                        <button className="level-btn" data-level="5">Decimals (.1)</button>
                      </div>
                    </div>

                    <div className="stats-hub">
                      <div className="stat-pill"><span className="stat-icon">🏆</span><span className="stat-lbl">SCORE:</span> <span id="quiz-score" className="stat-num">0</span></div>
                      <div className="stat-pill"><span className="stat-icon">🔥</span><span className="stat-lbl">STREAK:</span> <span id="quiz-streak" className="stat-num">0</span></div>
                      <div className="stat-pill"><span className="stat-icon">⏱️</span><span className="stat-lbl">TIMER:</span> <span id="quiz-timer" className="stat-num">0s</span></div>
                    </div>
                  </div>

                  <div className="quiz-stage-row">
                    <div className="quiz-prompt-card">
                      <span className="target-sublabel">👁️ READ THE ABACUS</span>
                      <p className="quiz-prompt-sub">What number do the beads below show?</p>
                    </div>

                    <div className="quiz-action-col">
                      <div className="quiz-input-action-row">
                        <div className="quiz-input-wrapper">
                          <input type="number" id="quiz-read-input" placeholder="Type answer..." step="any" />
                        </div>
                        <button id="quiz-read-submit-btn" className="action-btn-primary">Submit ↵</button>
                        <button id="quiz-hint-btn" className="action-btn-secondary">💡 Hint</button>
                        <button id="quiz-skip-btn" className="action-btn-secondary">Skip ⏭️</button>
                      </div>
                      <div id="quiz-feedback" className="practice-feedback info">
                        Inspect the beads below and enter your answer!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode 4: Flash Anzan Panel */}
              <div id="flash-anzan-panel" className="mode-panel hidden">
                <div className="anzan-control-card">
                  <div className="anzan-settings-row">
                    <div className="anzan-opt">
                      <label htmlFor="anzan-digits-select" className="control-label-badge">DIGITS</label>
                      <select id="anzan-digits-select" className="styled-select" defaultValue="2">
                        <option value="1">1 Digit (1-9)</option>
                        <option value="2">2 Digits (10-99)</option>
                        <option value="3">3 Digits (100-999)</option>
                      </select>
                    </div>
                    <div className="anzan-opt">
                      <label htmlFor="anzan-count-select" className="control-label-badge">COUNT</label>
                      <select id="anzan-count-select" className="styled-select" defaultValue="5">
                        <option value="3">3 Numbers</option>
                        <option value="5">5 Numbers</option>
                        <option value="8">8 Numbers</option>
                        <option value="10">10 Numbers</option>
                      </select>
                    </div>
                    <div className="anzan-opt">
                      <label htmlFor="anzan-speed-select" className="control-label-badge">SPEED</label>
                      <select id="anzan-speed-select" className="styled-select" defaultValue="1200">
                        <option value="2000">Slow (2.0s)</option>
                        <option value="1200">Medium (1.2s)</option>
                        <option value="800">Fast (0.8s)</option>
                        <option value="500">Master (0.5s)</option>
                      </select>
                    </div>
                    <div className="stats-hub anzan-stats">
                      <div className="stat-pill"><span className="stat-icon">🏆</span><span className="stat-lbl">SCORE:</span> <span id="anzan-score" className="stat-num">0</span></div>
                      <div className="stat-pill"><span className="stat-icon">🔥</span><span className="stat-lbl">STREAK:</span> <span id="anzan-streak" className="stat-num">0</span></div>
                    </div>
                    <button id="anzan-start-btn" className="action-btn-primary anzan-start-btn">⚡ Start Flash Test</button>
                  </div>

                  <div id="anzan-screen" className="anzan-screen">
                    <span className="anzan-prompt">Select settings and press &quot;⚡ Start Flash Test&quot; to begin mental calculation!</span>
                  </div>

                  <div id="anzan-answer-area" className="anzan-answer-area hidden">
                    <input type="number" id="anzan-user-answer" placeholder="Your calculated sum..." />
                    <button id="anzan-check-btn" className="action-btn-primary">Submit Answer</button>
                  </div>

                  <div id="anzan-feedback" className="practice-feedback info hidden" />
                </div>
              </div>

            </section>

            {/* Main Interactive Abacus Stage */}
            <main className="abacus-stage-container">
              
              {/* Interactive Anatomy & Introduction Guide Banner */}
              <div id="anatomy-guide-banner" className="anatomy-guide-banner hidden">
                <div className="anatomy-banner-content">
                  <div className="anatomy-banner-title-row">
                    <span className="anatomy-banner-badge">🧮 SOROBAN ANATOMY</span>
                    <h3 className="anatomy-banner-title">5 Parts of the Abacus (Pointed Out Below)</h3>
                  </div>
                  <p className="anatomy-banner-desc">
                    Every part is labeled with a pointer arrow directly on the abacus: <strong>Frame</strong>, <strong>Upper Beads</strong>, <strong>Beam (Answer Line)</strong>, <strong>Lower Beads</strong>, and <strong>Rods</strong>. Click any card to highlight it!
                  </p>
                </div>
                <div className="anatomy-banner-actions">
                  <button id="banner-touch-all-btn" className="anatomy-btn-action touch-btn" title="Slide all upper beads down and all lower beads up so every bead touches the beam">
                    <span className="btn-icon">✨</span> Touch All Beads to Beam
                  </button>
                  <button id="banner-set-zero-btn" className="anatomy-btn-action zero-btn" title="Watch left hand hold the frame and right hand pinch and slide along the beam to reset beads">
                    <span className="btn-icon">🖐️</span> Set to Zero (Watch Hands)
                  </button>
                  <button id="banner-close-btn" className="anatomy-btn-close" title="Hide pointer labels">
                    ✕ Close Labels
                  </button>
                </div>
              </div>

              <div id="units-rod-notice" className="units-rod-notice">
                Middle Rod (Rod #9) is the <strong>Units Rod (1s)</strong> with the center white dot.
              </div>

              {/* Main Display HUD */}
              <section className="readout-hud">
                <div className="readout-card main-counter-card">
                  <div className="readout-header">
                    <span className="readout-tag">ACTIVE ABACUS VALUE</span>
                    <span className="units-legend-badge">⚡ Middle Dot = Units (1s)</span>
                  </div>
                  <div className="display-value-wrapper">
                    <div className="lcd-glow-screen">
                      <span id="main-value-display" className="lcd-number">0</span>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Virtual Abacus Injected Here by JS */}
              <div id="abacus-container" className="abacus-render-target" />
              
              <div className="abacus-legend-bar">
                <div className="legend-item">
                  <span className="legend-swatch upper-swatch" />
                  <span><strong>Upper Deck (Heaven):</strong> 1 Bead = <strong>5</strong> (Move DOWN to beam to activate)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch beam-dot-swatch">⚡</span>
                  <span><strong>5 Reckoning Dots:</strong> Center Dot = <strong>Units (1s)</strong>, Left = <strong>Tens, Hundreds, Thousands...</strong></span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch lower-swatch" />
                  <span><strong>Lower Deck (Earth):</strong> 4 Beads = <strong>1 each</strong> (Move UP to beam to activate)</span>
                </div>
              </div>
            </main>

            {/* Footer Info */}
            <footer className="app-footer">
              <p>Interactive Virtual Soroban Abacus • Designed for students, parents, and competition speed training.</p>
              <p className="footer-shortcuts">Shortcuts: <kbd>Space</kbd> / <kbd>R</kbd> Clear • <kbd>←</kbd> <kbd>→</kbd> Select Rod • <kbd>↑</kbd> <kbd>↓</kbd> Adjust Value • <kbd>0-9</kbd> Set Digit</p>
            </footer>

          </div>

          {/* Guide / Tutorial Modal Dialog */}
          <div id="guide-modal" className="modal-backdrop hidden">
            <div className="modal-dialog">
              <div className="modal-header">
                <h2>📖 How to Read & Use a Soroban Abacus</h2>
                <button id="close-guide-btn" className="modal-close-btn" aria-label="Close Guide">✕</button>
              </div>
              <div className="modal-body">
                <div className="guide-grid">
                  <div className="guide-card">
                    <div className="guide-icon">⚡</div>
                    <h3>1. The 5 Reckoner Unit Dots</h3>
                    <p>Sorobans feature 5 white dots along the beam. The <strong>middle dot</strong> marks the <strong>Units column (10⁰ = 1s)</strong>. Every column to the left is multiplied by 10 (Tens, Hundreds, Thousands...), while columns to the right represent decimal fractions (Tenths, Hundredths...).</p>
                  </div>
                  <div className="guide-card">
                    <div className="guide-icon">☁️</div>
                    <h3>2. Upper Deck (Heaven Beads = 5)</h3>
                    <p>Each rod has 1 upper bead worth <strong>5</strong>. It is <strong>inactive</strong> when pushed up against the upper frame, and <strong>active</strong> when pulled down to touch the reckoning beam.</p>
                  </div>
                  <div className="guide-card">
                    <div className="guide-icon">🌍</div>
                    <h3>3. Lower Deck (Earth Beads = 1 Each)</h3>
                    <p>Each rod has 4 lower beads worth <strong>1 each</strong>. They are <strong>inactive</strong> when pushed down against the lower frame, and <strong>active</strong> when pushed UP to touch the reckoning beam.</p>
                  </div>
                  <div className="guide-card">
                    <div className="guide-icon">🔄</div>
                    <h3>4. Clearing to Zero</h3>
                    <p>To clear the abacus, push all upper beads UP and all lower beads DOWN away from the beam so that no beads touch the beam. Use the red <strong>CLEAR</strong> button or press <kbd>Space</kbd> or <kbd>R</kbd>!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
