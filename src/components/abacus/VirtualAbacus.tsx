"use client";

import React, { useEffect, useRef, useState } from "react";
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
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FAFAFE] via-[#F3F0FF]/40 to-[#F0F4FF] py-4 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto">
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
            </nav>

            {/* Dynamic Mode Panels */}
            <section id="mode-panels-area" className="mode-panels-area">
              
              {/* Mode 1: Free Play Control Strip */}
              <div id="free-play-panel" className="mode-panel hidden" style={{ display: 'none' }} />

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


            </section>

            {/* Main Interactive Abacus Stage */}
            <main className="abacus-stage-container">
              
              {/* Main Display HUD with Active Counter & Display Options */}
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

                <div className="readout-card display-options-card">
                  <div className="readout-header">
                    <span className="readout-tag">DISPLAY OPTIONS</span>
                    <span className="units-legend-badge view-badge">👁️ View Controls</span>
                  </div>
                  <div className="display-options-wrapper">
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
              </section>
              
              {/* Virtual Abacus Injected Here by JS */}
              <div id="abacus-container" className="abacus-render-target" />
              
            </main>

          </div>

        </div>
      </div>
    </div>
  );
}
