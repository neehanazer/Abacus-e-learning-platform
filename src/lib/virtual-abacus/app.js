import { AbacusModel } from "./abacus.js";
import { AbacusAudio, abacusAudio } from "./audio.js";
import { AbacusRenderer } from "./render.js";
import { AbacusPractice } from "./practice.js";
import { AbacusIntro } from "./intro.js";

/**
 * Main Application Controller for Virtual Abacus
 * Connects Model, Renderer, Practice, Audio and DOM Controls.
 */

function initAbacusApp() {
    if (typeof window !== "undefined" && !window.abacusAudio) {
        window.abacusAudio = abacusAudio;
    }
    // 1. Instantiate Core Abacus Model (17 rods competition abacus default: middle rod is 8 (Rod #9), has 5 white dots)
    const model = new AbacusModel(17);

    // 2. LCD Readout Elements
    const mainValueDisplay = document.getElementById('main-value-display');
    const unitsRodNotice = document.getElementById('units-rod-notice');

    let practice = null;

    // 3. Instantiate Renderer
    const abacusContainer = document.getElementById('abacus-container');
    const renderer = new AbacusRenderer(abacusContainer, model, {
        onValueChange: (numericVal, formattedStr) => {
            updateReadoutDisplays(numericVal, formattedStr);
            if (practice) {
                practice.onAbacusValueChange(numericVal);
            }
        }
    });

    // Initialize units rod notice for 17 rods
    if (unitsRodNotice) {
        unitsRodNotice.innerHTML = `Middle Rod (Rod #9) is the <strong>Units Rod (1s)</strong> with the center white dot.`;
    }

    // 4. Instantiate Practice & Quiz Engine
    practice = new AbacusPractice(model, renderer);

    // 4b. Instantiate Interactive Introduction Engine
    const intro = new AbacusIntro(model, renderer);

    // 5. Update Value Readout UI
    function updateReadoutDisplays(numericVal, formattedStr) {
        if (mainValueDisplay) {
            if (practice && practice.currentMode === 'quiz-read') {
                // In quiz mode, keep the LCD masked
                return;
            }
            mainValueDisplay.textContent = formattedStr || '0';
            mainValueDisplay.classList.add('val-pulse');
            setTimeout(() => mainValueDisplay.classList.remove('val-pulse'), 150);
        }
    }

    // 6. Bind Mode Tabs (Free Play / Make Number Challenge / Read Quiz / Flash Anzan)
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.dataset.mode;
            practice.setMode(mode);
        });
    });

    // 8. Rod Count Switcher (17 / 15 / 13 rods)
    const rodCountSelect = document.getElementById('rod-count-select');
    if (rodCountSelect) {
        const applyRodCount = (count) => {
            const numRods = parseInt(count, 10);
            model.setRodCount(numRods);
            renderer.renderRods();
            practice.clearHints();
            if (unitsRodNotice) {
                const centerIdx = Math.floor(numRods / 2) + 1;
                unitsRodNotice.innerHTML = `Middle Rod (Rod #${centerIdx}) is the <strong>Units Rod (1s)</strong> with the center white dot.`;
            }
        };
        rodCountSelect.addEventListener('change', (e) => applyRodCount(e.target.value));
        rodCountSelect.addEventListener('input', (e) => applyRodCount(e.target.value));
    }

    // 9. Theme Switcher
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            renderer.setTheme(e.target.value);
        });
    }

    // 10. Sound Toggle & Volume
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const soundVolumeSlider = document.getElementById('sound-volume-slider');

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            const isEnabled = window.abacusAudio.toggleSound();
            soundToggleBtn.classList.toggle('muted', !isEnabled);
            soundToggleBtn.innerHTML = isEnabled ? `🔊 <span class="btn-text">Sound ON</span>` : `🔇 <span class="btn-text">Muted</span>`;
        });
    }

    if (soundVolumeSlider) {
        soundVolumeSlider.addEventListener('input', (e) => {
            window.abacusAudio.setVolume(parseFloat(e.target.value));
        });
    }

    // 12. Direct Value Input Field & Quick Presets
    const directNumInput = document.getElementById('direct-num-input');
    const directNumSetBtn = document.getElementById('direct-num-set-btn');
    if (directNumSetBtn && directNumInput) {
        const applyDirectNumber = () => {
            const val = parseFloat(directNumInput.value);
            if (!isNaN(val) && val >= 0) {
                model.setTotalNumber(val);
                renderer.updateView();
                if (window.abacusAudio) window.abacusAudio.playBeadClick(true, true);
            }
        };
        directNumSetBtn.addEventListener('click', applyDirectNumber);
        directNumInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyDirectNumber();
        });
    }

    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.dataset.val);
            if (!isNaN(val)) {
                if (directNumInput) directNumInput.value = val;
                model.setTotalNumber(val);
                renderer.updateView();
                if (window.abacusAudio) window.abacusAudio.playBeadClick(true, true);
            }
        });
    });

    // 13. Visual Options Toggles
    const togglePlaceLabels = document.getElementById('toggle-place-labels');
    const toggleDigitLabels = document.getElementById('toggle-digit-labels');
    const toggleBeadTooltips = document.getElementById('toggle-bead-tooltips');

    if (togglePlaceLabels) {
        togglePlaceLabels.addEventListener('change', (e) => {
            const hdr = document.getElementById('place-labels-header');
            if (hdr) hdr.style.display = e.target.checked ? 'flex' : 'none';
        });
    }

    if (toggleDigitLabels) {
        toggleDigitLabels.addEventListener('change', (e) => {
            const ftr = document.getElementById('digit-labels-footer');
            if (ftr) ftr.style.display = e.target.checked ? 'flex' : 'none';
        });
    }

    if (toggleBeadTooltips) {
        toggleBeadTooltips.addEventListener('change', (e) => {
            document.body.classList.toggle('show-bead-tooltips', e.target.checked);
        });
    }

    // 14. Guide / Tutorial Modal
    const guideModal = document.getElementById('guide-modal');
    const openGuideBtn = document.getElementById('open-guide-btn');
    const closeGuideBtn = document.getElementById('close-guide-btn');

    if (openGuideBtn && guideModal) {
        openGuideBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    }
    if (closeGuideBtn && guideModal) {
        closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    }
    if (guideModal) {
        guideModal.addEventListener('click', (e) => {
            if (e.target === guideModal) guideModal.classList.add('hidden');
        });
    }

    // Initial update
    updateReadoutDisplays(0, '0');

    return {
        model,
        renderer,
        practice,
        intro
    };
}

if (typeof window !== "undefined") {
    window.initAbacusApp = initAbacusApp;
}

export { initAbacusApp };
export default initAbacusApp;
