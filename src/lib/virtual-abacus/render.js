/**
 * Visual Renderer & Interactive Physics Engine for Soroban Abacus
 * Handles SVG/DOM structure, bead sliding animations, touch & drag gestures.
 */

class AbacusRenderer {
    constructor(containerElement, model, options = {}) {
        this.container = containerElement;
        this.model = model;
        this.options = Object.assign({
            onValueChange: () => {},
            showDigitLabels: true,
            showPlaceLabels: true,
            showBeadValues: false,
            highlightActive: true
        }, options);

        this.selectedRodIndex = this.model.middleRodIndex;
        this.rodElements = [];

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.container.innerHTML = '';
        this.container.classList.add('abacus-wrapper');

        // Outer Abacus Frame
        const frame = document.createElement('div');
        frame.className = 'soroban-frame';
        frame.id = 'soroban-frame';

        // Top Frame Header with Brand Plaque & Quick Actions
        const frameHeader = document.createElement('div');
        frameHeader.className = 'frame-top-bar';

        const brandBadge = document.createElement('div');
        brandBadge.className = 'brand-plaque';
        brandBadge.innerHTML = `<span class="badge-icon">🧮</span> <span class="badge-text">SOROBAN • 算盤</span>`;

        const frameHeaderActions = document.createElement('div');
        frameHeaderActions.className = 'frame-header-actions';

        const touchAllBtn = document.createElement('button');
        touchAllBtn.className = 'abacus-tool-btn touch-all-btn';
        touchAllBtn.id = 'touch-all-beads-btn';
        touchAllBtn.title = 'Touch All Beads to Reckoning Beam / Answer Line';
        touchAllBtn.innerHTML = `<span class="btn-icon">✨</span> <span class="btn-label">TOUCH ALL BEADS</span>`;
        touchAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.touchAllBeadsToBeam();
        });

        const setZeroBtn = document.createElement('button');
        setZeroBtn.className = 'abacus-tool-btn set-zero-btn';
        setZeroBtn.id = 'set-to-zero-btn';
        setZeroBtn.title = 'Set to Zero with Animated Hand Slide Gesture';
        setZeroBtn.innerHTML = `<span class="btn-icon">🧹</span> <span class="btn-label">SET TO ZERO</span>`;
        setZeroBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.animateSetToZeroWithHands();
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'abacus-reset-btn';
        resetBtn.id = 'quick-reset-btn';
        resetBtn.title = 'Quick Clear Bar (Space / R)';
        resetBtn.innerHTML = `
            <span class="btn-icon">↺</span>
            <span class="btn-label">CLEAR</span>
        `;
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerResetAnimation();
        });

        frameHeaderActions.appendChild(touchAllBtn);
        frameHeaderActions.appendChild(setZeroBtn);
        frameHeaderActions.appendChild(resetBtn);

        frameHeader.appendChild(brandBadge);
        frameHeader.appendChild(frameHeaderActions);
        frame.appendChild(frameHeader);

        // Place Value Header Labels (Units, Tens, Hundreds...)
        const placeHeader = document.createElement('div');
        placeHeader.className = 'place-labels-header';
        placeHeader.id = 'place-labels-header';
        frame.appendChild(placeHeader);

        // Main Board Area (Upper Deck + Reckoning Beam with 5 White Dots + Lower Deck)
        const boardArea = document.createElement('div');
        boardArea.className = 'abacus-board-area';
        boardArea.id = 'abacus-board-area';

        // Upper Deck Container
        const upperDeck = document.createElement('div');
        upperDeck.className = 'deck upper-deck';
        upperDeck.id = 'upper-deck';

        // Reckoning Beam (Separator Bar with 5 White Reckoner Dots)
        const beam = document.createElement('div');
        beam.className = 'reckoning-beam';
        beam.id = 'reckoning-beam';

        // Lower Deck Container
        const lowerDeck = document.createElement('div');
        lowerDeck.className = 'deck lower-deck';
        lowerDeck.id = 'lower-deck';

        boardArea.appendChild(upperDeck);
        boardArea.appendChild(beam);
        boardArea.appendChild(lowerDeck);
        frame.appendChild(boardArea);

        // Overlay for Animated Hands (Left Hand Gripping Frame, Right Hand Sliding)
        const handsOverlay = document.createElement('div');
        handsOverlay.className = 'soroban-hands-overlay';
        handsOverlay.id = 'soroban-hands-overlay';
        frame.appendChild(handsOverlay);

        // Overlay for Anatomy Pointer Arrows & Labels
        const anatomyOverlay = document.createElement('div');
        anatomyOverlay.className = 'soroban-anatomy-overlay hidden';
        anatomyOverlay.id = 'soroban-anatomy-overlay';
        frame.appendChild(anatomyOverlay);

        // Overlay for Introduction Anatomy Spotlight Callout Badges
        const spotlightOverlay = document.createElement('div');
        spotlightOverlay.className = 'soroban-spotlight-overlay';
        spotlightOverlay.id = 'soroban-spotlight-overlay';
        frame.appendChild(spotlightOverlay);

        // Digit Badges Footer (0-9 for each rod)
        const digitFooter = document.createElement('div');
        digitFooter.className = 'digit-labels-footer';
        digitFooter.id = 'digit-labels-footer';
        frame.appendChild(digitFooter);

        this.container.appendChild(frame);

        this.frame = frame;
        this.boardArea = boardArea;
        this.placeHeader = placeHeader;
        this.upperDeck = upperDeck;
        this.beam = beam;
        this.lowerDeck = lowerDeck;
        this.digitFooter = digitFooter;
        this.handsOverlay = handsOverlay;
        this.anatomyOverlay = anatomyOverlay;
        this.spotlightOverlay = spotlightOverlay;

        this.renderRods();
    }

    renderRods() {
        this.placeHeader.innerHTML = '';
        this.upperDeck.innerHTML = '';
        this.beam.innerHTML = '';
        this.lowerDeck.innerHTML = '';
        this.digitFooter.innerHTML = '';

        const rodCount = this.model.rodCount;
        this.rodElements = [];

        for (let i = 0; i < rodCount; i++) {
            const rodData = this.model.rods[i];
            const isUnitsRod = (i === this.model.middleRodIndex);

            const colorIdx = Math.abs(i - this.model.middleRodIndex) % 7;

            // 1. Place Label
            const placeCell = document.createElement('div');
            placeCell.className = `place-cell ${isUnitsRod ? 'is-units-rod' : ''}`;
            placeCell.dataset.rodIndex = i;
            placeCell.innerHTML = `
                <span class="place-short">${rodData.shortName}</span>
                <span class="place-full">${rodData.name}</span>
            `;
            this.placeHeader.appendChild(placeCell);

            // 2. Upper Deck Column (1 bead)
            const upperCol = document.createElement('div');
            upperCol.className = `rod-column upper-rod-col color-${colorIdx} ${isUnitsRod ? 'is-units-col' : ''}`;
            upperCol.dataset.rodIndex = i;

            const rodWireUpper = document.createElement('div');
            rodWireUpper.className = 'rod-wire';
            upperCol.appendChild(rodWireUpper);

            const upperBead = this.createBeadElement(i, 'upper', 0, 5);
            upperCol.appendChild(upperBead);
            this.upperDeck.appendChild(upperCol);

            // 3. Reckoning Beam Unit Dots (5 White Dots)
            const beamCell = document.createElement('div');
            beamCell.className = `beam-cell ${rodData.hasDot ? 'has-dot' : ''} ${isUnitsRod ? 'units-dot-cell' : ''}`;
            beamCell.dataset.rodIndex = i;

            if (rodData.hasDot) {
                const whiteDot = document.createElement('div');
                whiteDot.className = `reckoner-white-dot ${isUnitsRod ? 'units-white-dot' : ''}`;
                whiteDot.title = isUnitsRod ? 'Units Rod (Center Dot)' : 'Reckoner Unit Marker';
                beamCell.appendChild(whiteDot);
            }
            this.beam.appendChild(beamCell);

            // 4. Lower Deck Column (4 beads)
            const lowerCol = document.createElement('div');
            lowerCol.className = `rod-column lower-rod-col color-${colorIdx} ${isUnitsRod ? 'is-units-col' : ''}`;
            lowerCol.dataset.rodIndex = i;

            const rodWireLower = document.createElement('div');
            rodWireLower.className = 'rod-wire';
            lowerCol.appendChild(rodWireLower);

            const lowerBeads = [];
            for (let b = 0; b < 4; b++) {
                // b=0 is topmost lower bead (near beam), b=3 is bottom lower bead
                const lowerBead = this.createBeadElement(i, 'lower', b, 1);
                lowerCol.appendChild(lowerBead);
                lowerBeads.push(lowerBead);
            }
            this.lowerDeck.appendChild(lowerCol);

            // 5. Digit Display Footer
            const digitCell = document.createElement('div');
            digitCell.className = `digit-cell ${isUnitsRod ? 'is-units-digit' : ''}`;
            digitCell.dataset.rodIndex = i;
            digitCell.innerHTML = `<span class="digit-badge">0</span>`;
            this.digitFooter.appendChild(digitCell);

            this.rodElements.push({
                index: i,
                placeCell,
                upperCol,
                upperBead,
                beamCell,
                lowerCol,
                lowerBeads,
                digitCell,
                digitBadge: digitCell.querySelector('.digit-badge')
            });
        }

        this.updateView(false);
    }

    createBeadElement(rodIndex, type, beadIndex, beadValue) {
        const bead = document.createElement('div');
        bead.className = `soroban-bead bead-${type} ${type === 'upper' ? 'bead-val-5' : 'bead-val-1'}`;
        bead.dataset.rodIndex = rodIndex;
        bead.dataset.beadType = type;
        bead.dataset.beadIndex = beadIndex;
        bead.dataset.value = beadValue;

        // Seamless smooth 3D bead body (no middle line)
        bead.innerHTML = `
            <div class="bead-body">
                <div class="bead-highlight"></div>
                <div class="bead-hole"></div>
                <span class="bead-val-tooltip">${beadValue}</span>
            </div>
        `;

        // Direct click / touch handler on each bead
        bead.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleBeadClick(rodIndex, type, beadIndex);
        });

        return bead;
    }

    // Refresh DOM bead positions according to model state
    updateView(animateSound = false) {
        for (let i = 0; i < this.model.rodCount; i++) {
            const rodData = this.model.rods[i];
            const elem = this.rodElements[i];
            if (!elem) continue;

            // Update Upper Bead: active = moved down to beam, inactive = moved up to frame
            if (rodData.upperActive) {
                elem.upperBead.classList.add('is-active', 'down-at-beam');
                elem.upperBead.classList.remove('up-at-frame');
            } else {
                elem.upperBead.classList.remove('is-active', 'down-at-beam');
                elem.upperBead.classList.add('up-at-frame');
            }

            // Update Lower Beads (4 beads)
            // rodData.lowerCount = number of active lower beads (0..4)
            // Lower beads are indexed 0 (closest to beam) to 3 (furthest from beam)
            for (let b = 0; b < 4; b++) {
                const beadElem = elem.lowerBeads[b];
                const isActive = (b < rodData.lowerCount);
                if (isActive) {
                    beadElem.classList.add('is-active', 'up-at-beam');
                    beadElem.classList.remove('down-at-frame');
                } else {
                    beadElem.classList.remove('is-active', 'up-at-beam');
                    beadElem.classList.add('down-at-frame');
                }
            }

            // Update Digit Badge
            const digit = this.model.getRodDigit(i);
            elem.digitBadge.textContent = digit;
            if (digit > 0) {
                elem.digitCell.classList.add('has-value');
            } else {
                elem.digitCell.classList.remove('has-value');
            }
        }

        // Notify app of value update
        this.options.onValueChange(this.model.getTotalValue(), this.model.getFormattedValue());
    }

    // Interactive event bindings
    bindEvents() {
        const board = this.boardArea || this.container.querySelector('.abacus-board-area');

        // Delegation fallback for click
        if (board) {
            board.addEventListener('click', (e) => {
                const bead = e.target.closest('.soroban-bead');
                if (!bead) return;

                const rodIdx = parseInt(bead.dataset.rodIndex, 10);
                const beadType = bead.dataset.beadType;
                const beadIdx = parseInt(bead.dataset.beadIndex, 10);

                this.handleBeadClick(rodIdx, beadType, beadIdx);
            });

            this.setupDragSupport(board);
        }

        // Keyboard Support
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.triggerResetAnimation();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.selectRod(Math.max(0, this.selectedRodIndex - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.selectRod(Math.min(this.model.rodCount - 1, this.selectedRodIndex + 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.incrementSelectedRod();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.decrementSelectedRod();
            } else if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                this.setSelectedRodDigit(parseInt(e.key, 10));
            }
        });
    }

    handleBeadClick(rodIdx, beadType, beadIdx) {
        if (beadType === 'upper') {
            const wasActive = this.model.rods[rodIdx].upperActive;
            const nowActive = this.model.toggleUpper(rodIdx);
            if (window.abacusAudio) {
                window.abacusAudio.playBeadClick(true, nowActive);
            }
        } else {
            const currentCount = this.model.rods[rodIdx].lowerCount;
            const newCount = this.model.clickLowerBead(rodIdx, beadIdx);
            if (window.abacusAudio) {
                const isActivating = newCount > currentCount;
                window.abacusAudio.playBeadClick(false, isActivating, Math.abs(newCount - currentCount) * 0.4 + 0.6);
            }
        }

        this.selectedRodIndex = rodIdx;
        this.highlightSelectedRod();
        this.updateView(true);
    }

    setupDragSupport(board) {
        let isDown = false;
        let startY = 0;
        let activeRod = -1;
        let activeType = null;
        let activeBeadIdx = -1;

        const onPointerDown = (e) => {
            const bead = e.target.closest('.soroban-bead');
            if (!bead) return;

            isDown = true;
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            activeRod = parseInt(bead.dataset.rodIndex, 10);
            activeType = bead.dataset.beadType;
            activeBeadIdx = parseInt(bead.dataset.beadIndex, 10);
        };

        const onPointerMove = (e) => {
            if (!isDown || activeRod === -1) return;
            const currentY = e.clientY || (e.touches && e.touches[0].clientY);
            const deltaY = currentY - startY;

            // Vertical swipe threshold
            if (Math.abs(deltaY) > 16) {
                if (activeType === 'upper') {
                    // Upper deck: Swipe DOWN = activate (move to beam), Swipe UP = deactivate
                    if (deltaY > 0 && !this.model.rods[activeRod].upperActive) {
                        this.model.setUpper(activeRod, true);
                        if (window.abacusAudio) window.abacusAudio.playBeadClick(true, true);
                        this.updateView();
                    } else if (deltaY < 0 && this.model.rods[activeRod].upperActive) {
                        this.model.setUpper(activeRod, false);
                        if (window.abacusAudio) window.abacusAudio.playBeadClick(true, false);
                        this.updateView();
                    }
                } else if (activeType === 'lower') {
                    // Lower deck: Swipe UP = activate, Swipe DOWN = deactivate
                    if (deltaY < 0) {
                        const current = this.model.rods[activeRod].lowerCount;
                        if (activeBeadIdx >= current) {
                            this.model.setLowerCount(activeRod, activeBeadIdx + 1);
                            if (window.abacusAudio) window.abacusAudio.playBeadClick(false, true);
                            this.updateView();
                        }
                    } else if (deltaY > 0) {
                        const current = this.model.rods[activeRod].lowerCount;
                        if (activeBeadIdx < current) {
                            this.model.setLowerCount(activeRod, activeBeadIdx);
                            if (window.abacusAudio) window.abacusAudio.playBeadClick(false, false);
                            this.updateView();
                        }
                    }
                }
                startY = currentY;
            }
        };

        const onPointerUp = () => {
            isDown = false;
            activeRod = -1;
            activeType = null;
        };

        board.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        board.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);
    }

    selectRod(rodIdx) {
        this.selectedRodIndex = rodIdx;
        this.highlightSelectedRod();
    }

    highlightSelectedRod() {
        this.rodElements.forEach((elem, idx) => {
            if (idx === this.selectedRodIndex) {
                elem.upperCol.classList.add('is-rod-selected');
                elem.lowerCol.classList.add('is-rod-selected');
                elem.digitCell.classList.add('is-rod-selected');
            } else {
                elem.upperCol.classList.remove('is-rod-selected');
                elem.lowerCol.classList.remove('is-rod-selected');
                elem.digitCell.classList.remove('is-rod-selected');
            }
        });
    }

    incrementSelectedRod() {
        const cur = this.model.getRodDigit(this.selectedRodIndex);
        if (cur < 9) {
            this.model.setRodValue(this.selectedRodIndex, cur + 1);
            if (window.abacusAudio) window.abacusAudio.playBeadClick(cur === 4, true);
            this.updateView();
        }
    }

    decrementSelectedRod() {
        const cur = this.model.getRodDigit(this.selectedRodIndex);
        if (cur > 0) {
            this.model.setRodValue(this.selectedRodIndex, cur - 1);
            if (window.abacusAudio) window.abacusAudio.playBeadClick(cur === 5, false);
            this.updateView();
        }
    }

    setSelectedRodDigit(digit) {
        this.model.setRodValue(this.selectedRodIndex, digit);
        if (window.abacusAudio) window.abacusAudio.playBeadClick(digit >= 5, true);
        this.updateView();
    }

    // Trigger authentic sweeping reset animation and clatter
    triggerResetAnimation() {
        const resetBtn = document.getElementById('quick-reset-btn');
        if (resetBtn) {
            resetBtn.classList.add('is-pressed');
            setTimeout(() => resetBtn.classList.remove('is-pressed'), 200);
        }

        if (window.abacusAudio) {
            window.abacusAudio.playResetSound();
        }

        const rods = this.model.rods;
        rods.forEach((rod, i) => {
            setTimeout(() => {
                this.model.setRodValue(i, 0);
                this.updateView();
            }, (i / rods.length) * 120);
        });
    }

    // Touch all beads to the reckoning beam / answer line
    touchAllBeadsToBeam() {
        this.model.touchAllBeadsToBeam();
        if (window.abacusAudio) {
            window.abacusAudio.playBeadClick(true, true);
        }
        this.updateView(true);
    }

    // Authentic two-handed Soroban clearing animation (Left hand holds frame, Right hand forefinger & thumb slide across beam)
    animateSetToZeroWithHands(onComplete) {
        if (this.isHandsAnimating) return;
        this.isHandsAnimating = true;

        if (!this.handsOverlay) return;
        this.handsOverlay.innerHTML = '';
        this.handsOverlay.style.display = 'block';

        // 1. Create Left Hand (holding the left wooden rail of frame)
        const leftHand = document.createElement('div');
        leftHand.className = 'soroban-hand-anim left-hand';
        leftHand.innerHTML = `
            <svg class="hand-svg left-svg" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="hand-sh-l" x="-20%" y="-20%" width="150%" height="150%">
                        <feDropShadow dx="-2" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.55)"/>
                    </filter>
                    <linearGradient id="skin-l" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f8c291"/>
                        <stop offset="50%" stop-color="#e59866"/>
                        <stop offset="100%" stop-color="#d35400"/>
                    </linearGradient>
                    <linearGradient id="skin-thumb" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fcd5b5"/>
                        <stop offset="65%" stop-color="#e59866"/>
                        <stop offset="100%" stop-color="#c0521e"/>
                    </linearGradient>
                </defs>
                <g filter="url(#hand-sh-l)">
                    <path d="M 0,65 C 25,60 45,68 62,78 C 72,84 82,94 88,108 C 93,122 88,142 75,156 C 60,172 38,178 0,178 Z" fill="url(#skin-l)"/>
                    <path d="M 68,145 C 76,149 86,145 88,137 C 90,129 84,123 76,122" fill="#d35400" stroke="#ba4a00" stroke-width="1.2"/>
                    <path d="M 74,133 C 85,137 95,131 97,121 C 99,111 90,105 80,104" fill="#df691a" stroke="#ba4a00" stroke-width="1.2"/>
                    <path d="M 78,119 C 92,122 102,115 104,103 C 106,91 96,85 84,84" fill="#e57e33" stroke="#ba4a00" stroke-width="1.2"/>
                    <path d="M 80,102 C 95,105 106,95 107,82 C 108,69 98,63 84,65" fill="#e88944" stroke="#ba4a00" stroke-width="1.2"/>
                    <path d="M 45,72 C 60,67 80,69 88,82 C 95,93 92,109 85,122 C 75,137 55,145 40,137 Z" fill="url(#skin-l)"/>
                    <path d="M 62,77 C 68,72 80,67 95,71 C 108,74 118,82 116,93 C 114,104 102,109 88,107 C 76,105 68,95 62,85 Z" fill="url(#skin-thumb)" stroke="#c0521e" stroke-width="1.5"/>
                    <ellipse cx="106" cy="85" rx="6" ry="9" transform="rotate(-15 106 85)" fill="#fff5ee" stroke="#d9825b" stroke-width="1"/>
                    <ellipse cx="105" cy="83" rx="2.5" ry="5" transform="rotate(-15 105 83)" fill="#ffffff" opacity="0.8"/>
                    <g transform="translate(6, 25)">
                        <rect x="0" y="0" width="88" height="22" rx="6" fill="#1e293b" opacity="0.92" stroke="#f59e0b" stroke-width="1.2"/>
                        <text x="44" y="15" fill="#fef08a" font-size="10" font-weight="800" font-family="sans-serif" text-anchor="middle">LEFT: HOLD</text>
                    </g>
                </g>
            </svg>
        `;
        this.handsOverlay.appendChild(leftHand);

        // 2. Create Right Hand (Forefinger & Thumb straddling the reckoning beam)
        const rightHand = document.createElement('div');
        rightHand.className = 'soroban-hand-anim right-hand';
        rightHand.innerHTML = `
            <svg class="hand-svg right-svg" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="hand-sh-r" x="-20%" y="-20%" width="150%" height="150%">
                        <feDropShadow dx="-3" dy="6" stdDeviation="6" flood-color="rgba(0,0,0,0.6)"/>
                    </filter>
                    <linearGradient id="skin-r" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fcd5b5"/>
                        <stop offset="50%" stop-color="#e59866"/>
                        <stop offset="100%" stop-color="#c0521e"/>
                    </linearGradient>
                    <linearGradient id="skin-finger-u" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#e59866"/>
                        <stop offset="50%" stop-color="#f8c291"/>
                        <stop offset="100%" stop-color="#fde8d7"/>
                    </linearGradient>
                    <linearGradient id="skin-thumb-d" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#df7d47"/>
                        <stop offset="50%" stop-color="#f8c291"/>
                        <stop offset="100%" stop-color="#fde8d7"/>
                    </linearGradient>
                </defs>
                <g filter="url(#hand-sh-r)">
                    <path d="M 180,20 C 195,30 215,45 240,60 L 240,140 C 210,135 185,120 170,110 Z" fill="url(#skin-r)"/>
                    <path d="M 145,130 C 130,135 118,125 120,115 C 122,106 135,105 148,112 Z" fill="#b04618" stroke="#8d320c" stroke-width="1"/>
                    <path d="M 138,116 C 122,120 110,110 112,98 C 114,88 128,88 142,96 Z" fill="#c45620" stroke="#8d320c" stroke-width="1"/>
                    <path d="M 130,100 C 114,103 100,92 102,80 C 104,68 118,68 134,78 Z" fill="#d96c2e" stroke="#8d320c" stroke-width="1"/>
                    <path d="M 115,55 C 140,40 170,45 190,65 C 205,80 195,115 175,125 C 150,135 130,120 115,100 Z" fill="url(#skin-r)"/>

                    <!-- Forefinger: Upper Deck (rests right above beam) -->
                    <path d="M 125,56 C 105,50 70,52 35,55 C 20,56 10,62 12,68 C 14,74 24,76 40,75 C 75,74 110,75 130,76 Z" 
                          fill="url(#skin-finger-u)" stroke="#b84d1b" stroke-width="1.2"/>
                    <ellipse cx="22" cy="65" rx="7" ry="5" transform="rotate(-5 22 65)" fill="#fff5ee" stroke="#d9825b" stroke-width="1"/>
                    <ellipse cx="21" cy="64" rx="3" ry="2.5" fill="#ffffff" opacity="0.8"/>

                    <!-- Thumb: Lower Deck (rests right below beam) -->
                    <path d="M 140,105 C 115,102 80,98 45,95 C 28,93 18,97 18,103 C 18,109 28,114 48,115 C 80,116 115,120 135,116 Z" 
                          fill="url(#skin-thumb-d)" stroke="#b84d1b" stroke-width="1.2"/>
                    <ellipse cx="28" cy="103" rx="7" ry="5.5" transform="rotate(5 28 103)" fill="#fff5ee" stroke="#d9825b" stroke-width="1"/>
                    <ellipse cx="27" cy="102" rx="3" ry="2.5" fill="#ffffff" opacity="0.8"/>

                    <!-- Motion indicator arrows -->
                    <path d="M 8,72 L -6,72 M -6,72 L -2,68 M -6,72 L -2,76" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M 12,94 L -2,94 M -2,94 L 2,90 M -2,94 L 2,98" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>

                    <g transform="translate(125, 20)">
                        <rect x="0" y="0" width="100" height="22" rx="6" fill="#1e293b" opacity="0.92" stroke="#38bdf8" stroke-width="1.2"/>
                        <text x="50" y="15" fill="#7dd3fc" font-size="10" font-weight="800" font-family="sans-serif" text-anchor="middle">RIGHT: SLIDE ➔</text>
                    </g>
                </g>
            </svg>
        `;
        this.handsOverlay.appendChild(rightHand);

        // Calculate positions relative to frame
        const firstRod = this.rodElements[0];
        const lastRod = this.rodElements[this.rodElements.length - 1];
        if (!firstRod || !lastRod) {
            this.isHandsAnimating = false;
            return;
        }

        const frameRect = this.frame.getBoundingClientRect();
        const firstRect = firstRod.upperCol.getBoundingClientRect();
        const lastRect = lastRod.upperCol.getBoundingClientRect();
        const beamRect = this.beam.getBoundingClientRect();

        const startX = (firstRect.left - frameRect.left) - 30;
        const endX = (lastRect.right - frameRect.left) + 25;
        const beamCenterY = (beamRect.top + beamRect.height / 2) - frameRect.top;
        const beamY = beamCenterY - 82; // center finger slot in SVG

        leftHand.style.left = '-34px';
        leftHand.style.top = `${beamCenterY - 70}px`;

        rightHand.style.top = `${beamY}px`;
        rightHand.style.left = `${startX}px`;

        // Reveal Left Hand holding frame
        requestAnimationFrame(() => {
            leftHand.classList.add('visible');
        });

        // Start Right Hand slide
        setTimeout(() => {
            rightHand.classList.add('visible');

            const duration = Math.min(2400, Math.max(1500, this.model.rodCount * 115));
            const startTime = performance.now();
            const clearedRods = new Set();

            const animateStep = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / duration);
                const curX = startX + progress * (endX - startX);
                rightHand.style.left = `${curX}px`;

                const fingerTipX = curX + 25;

                for (let i = 0; i < this.model.rodCount; i++) {
                    if (clearedRods.has(i)) continue;
                    const rodCol = this.rodElements[i].upperCol;
                    const rCol = rodCol.getBoundingClientRect();
                    const rodCenterX = (rCol.left + rCol.width / 2) - frameRect.left;

                    if (fingerTipX >= rodCenterX) {
                        clearedRods.add(i);
                        const hadValue = (this.model.rods[i].upperActive || this.model.rods[i].lowerCount > 0);
                        this.model.setUpper(i, false);
                        this.model.setLowerCount(i, 0);

                        // Update single rod DOM elements
                        const elem = this.rodElements[i];
                        elem.upperBead.classList.remove('is-active', 'down-at-beam');
                        elem.upperBead.classList.add('up-at-frame');
                        for (let b = 0; b < 4; b++) {
                            elem.lowerBeads[b].classList.remove('is-active', 'up-at-beam');
                            elem.lowerBeads[b].classList.add('down-at-frame');
                        }
                        elem.digitBadge.textContent = '0';
                        elem.digitCell.classList.remove('has-value');

                        // Dynamic live LCD roll-down count as hand clears each rod
                        if (this.callbacks.onValueChange) {
                            const liveVal = this.model.calculateTotal();
                            this.callbacks.onValueChange(liveVal, this.model.formatTotalDisplay(liveVal));
                        }

                        if (hadValue && window.abacusAudio) {
                            window.abacusAudio.playBeadClick(false, false, 0.75);
                        }
                    }
                }

                if (progress < 1) {
                    requestAnimationFrame(animateStep);
                } else {
                    // Sweeping slide finished
                    this.updateView(false);
                    if (window.abacusAudio) {
                        window.abacusAudio.playResetSound();
                    }
                    rightHand.classList.add('finished');
                    setTimeout(() => {
                        leftHand.classList.remove('visible');
                        rightHand.classList.remove('visible');
                        setTimeout(() => {
                            this.handsOverlay.innerHTML = '';
                            this.handsOverlay.style.display = 'none';
                            this.isHandsAnimating = false;
                            if (onComplete) onComplete();
                        }, 350);
                    }, 280);
                }
            };

            requestAnimationFrame(animateStep);
        }, 200);
    }

    // Direct Anatomy Pointer Overlay: Points directly to every part of the Abacus with labels
    showAnatomyPointers() {
        if (!this.anatomyOverlay) return;
        this.anatomyOverlay.classList.remove('hidden');
        this.anatomyOverlay.style.display = 'block';
        this.anatomyOverlay.innerHTML = '';

        const frameRect = this.frame.getBoundingClientRect();

        // Part 1: Outer Frame (Top-left hardwood corner)
        const pFrameTarget = { x: 25, y: 35 };
        const pFrameLabel = { x: 18, y: -45 };

        // Part 2: Upper Beads (Heaven bead on Rod 4)
        const rodUpperIdx = Math.min(4, this.model.rodCount - 1);
        const rodUpper = this.rodElements[rodUpperIdx].upperBead;
        const rUpper = rodUpper.getBoundingClientRect();
        const pUpperTarget = {
            x: (rUpper.left + rUpper.width / 2) - frameRect.left,
            y: (rUpper.top + rUpper.height / 2) - frameRect.top
        };
        const pUpperLabel = { x: pUpperTarget.x - 75, y: pUpperTarget.y - 70 };

        // Part 3: Reckoning Beam (Answer Line) - Rod 8 / Center Units Rod
        const midIdx = this.model.middleRodIndex;
        const midCol = this.rodElements[midIdx].upperCol;
        const rMid = midCol.getBoundingClientRect();
        const rBeam = this.beam.getBoundingClientRect();
        const pBeamTarget = {
            x: (rMid.left + rMid.width / 2) - frameRect.left,
            y: (rBeam.top + rBeam.height / 2) - frameRect.top
        };
        const pBeamLabel = { x: pBeamTarget.x - 95, y: pBeamTarget.y - 68 };

        // Part 4: Lower Beads (Earth beads on Rod 11)
        const rodLowerIdx = Math.min(11, this.model.rodCount - 1);
        const rodLower = this.rodElements[rodLowerIdx].lowerBeads[1];
        const rLower = rodLower.getBoundingClientRect();
        const pLowerTarget = {
            x: (rLower.left + rLower.width / 2) - frameRect.left,
            y: (rLower.top + rLower.height / 2) - frameRect.top
        };
        const pLowerLabel = { x: pLowerTarget.x - 75, y: pLowerTarget.y + 44 };

        // Part 5: Rods (Place value bamboo wire on Rod 14)
        const rodWireIdx = Math.min(14, this.model.rodCount - 1);
        const rodWireCol = this.rodElements[rodWireIdx].upperCol;
        const rWire = rodWireCol.getBoundingClientRect();
        const pRodsTarget = {
            x: (rWire.left + rWire.width / 2) - frameRect.left,
            y: (rWire.top + rWire.height + 25) - frameRect.top
        };
        const pRodsLabel = { x: pRodsTarget.x - 65, y: pRodsTarget.y - 72 };

        const partsData = [
            {
                id: 'frame',
                num: 1,
                name: 'FRAME',
                sub: 'Outer hardwood frame holds all rods & beads',
                color: '#f59e0b',
                target: pFrameTarget,
                label: pFrameLabel,
                arrowStart: { x: pFrameLabel.x + 40, y: pFrameLabel.y + 36 },
                highlight: 'frame'
            },
            {
                id: 'upper',
                num: 2,
                name: 'UPPER BEADS',
                sub: 'Heaven beads (Worth 5 each • Active when pulled DOWN)',
                color: '#38bdf8',
                target: pUpperTarget,
                label: pUpperLabel,
                arrowStart: { x: pUpperLabel.x + 75, y: pUpperLabel.y + 40 },
                highlight: 'upper'
            },
            {
                id: 'beam',
                num: 3,
                name: 'BEAM (ANSWER LINE)',
                sub: 'Dividing bar • Beads count ONLY when touching this beam!',
                color: '#ec4899',
                target: pBeamTarget,
                label: pBeamLabel,
                arrowStart: { x: pBeamLabel.x + 95, y: pBeamLabel.y + 40 },
                highlight: 'beam'
            },
            {
                id: 'lower',
                num: 4,
                name: 'LOWER BEADS',
                sub: 'Earth beads (Worth 1 each • 4 per rod • Active when pushed UP)',
                color: '#10b981',
                target: pLowerTarget,
                label: pLowerLabel,
                arrowStart: { x: pLowerLabel.x + 75, y: pLowerLabel.y - 2 },
                highlight: 'lower'
            },
            {
                id: 'rods',
                num: 5,
                name: 'RODS',
                sub: 'Vertical columns for place values (1s, 10s, 100s...)',
                color: '#a855f7',
                target: pRodsTarget,
                label: pRodsLabel,
                arrowStart: { x: pRodsLabel.x + 65, y: pRodsLabel.y + 40 },
                highlight: 'rods'
            }
        ];

        // Build SVG Canvas with Arrow Markers and Pulsing Targets
        let svgHtml = `
            <svg class="anatomy-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
        `;

        partsData.forEach(p => {
            svgHtml += `
                <marker id="marker-${p.id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${p.color}" />
                </marker>
            `;
        });

        svgHtml += `
                </defs>
        `;

        partsData.forEach(p => {
            svgHtml += `
                <!-- Leader Line for ${p.name} -->
                <line x1="${p.arrowStart.x}" y1="${p.arrowStart.y}" x2="${p.target.x}" y2="${p.target.y}"
                      stroke="${p.color}" stroke-width="2.5" stroke-dasharray="4,2"
                      marker-end="url(#marker-${p.id})" class="anatomy-arrow-line" id="line-${p.id}"/>
                
                <!-- Target Pulse Point -->
                <circle cx="${p.target.x}" cy="${p.target.y}" r="4.5" fill="#ffffff" stroke="${p.color}" stroke-width="2.5" class="anatomy-target-dot"/>
                <circle cx="${p.target.x}" cy="${p.target.y}" r="12" fill="none" stroke="${p.color}" stroke-width="1.5" class="anatomy-pulse-ring"/>
            `;
        });

        svgHtml += `</svg>`;

        // Build HTML Label Cards
        let cardsHtml = '';
        partsData.forEach(p => {
            cardsHtml += `
                <div class="anatomy-pointer-card" id="card-${p.id}"
                     style="left: ${p.label.x}px; top: ${p.label.y}px; --card-color: ${p.color};"
                     data-part="${p.highlight}">
                    <div class="pointer-card-badge">
                        <span class="pointer-num" style="background: ${p.color};">${p.num}</span>
                        <span class="pointer-title">${p.name}</span>
                    </div>
                    <div class="pointer-card-desc">${p.sub}</div>
                </div>
            `;
        });

        this.anatomyOverlay.innerHTML = svgHtml + cardsHtml;

        // Attach Click & Hover on Cards
        partsData.forEach(p => {
            const cardElem = this.anatomyOverlay.querySelector(`#card-${p.id}`);
            if (cardElem) {
                cardElem.addEventListener('mouseenter', () => {
                    this.highlightIntroPart(p.highlight, p.name);
                });
                cardElem.addEventListener('mouseleave', () => {
                    this.clearIntroHighlights();
                });
                cardElem.addEventListener('click', () => {
                    this.highlightIntroPart(p.highlight, p.name);
                    if (window.abacusAudio) window.abacusAudio.playBeadClick(true, true);
                });
            }
        });
    }

    hideAnatomyPointers() {
        if (!this.anatomyOverlay) return;
        this.anatomyOverlay.classList.add('hidden');
        this.anatomyOverlay.style.display = 'none';
        this.anatomyOverlay.innerHTML = '';
        this.clearIntroHighlights();
    }

    toggleAnatomyPointers() {
        if (!this.anatomyOverlay) return false;
        if (this.anatomyOverlay.classList.contains('hidden') || this.anatomyOverlay.style.display === 'none') {
            this.showAnatomyPointers();
            return true;
        } else {
            this.hideAnatomyPointers();
            return false;
        }
    }

    // Introduction Visual Spotlight on Soroban Parts
    highlightIntroPart(partName, label) {
        this.clearIntroHighlights();
        if (!partName) return;

        if (partName === 'frame') {
            this.frame.classList.add('intro-spotlight-frame');
            this.showCalloutBadge(this.frame, label, 'top-left');
        } else if (partName === 'upper') {
            this.upperDeck.classList.add('intro-spotlight-deck');
            this.showCalloutBadge(this.upperDeck, label, 'top');
        } else if (partName === 'beam') {
            this.beam.classList.add('intro-spotlight-beam');
            this.showCalloutBadge(this.beam, label, 'center');
        } else if (partName === 'lower') {
            this.lowerDeck.classList.add('intro-spotlight-deck');
            this.showCalloutBadge(this.lowerDeck, label, 'bottom');
        } else if (partName === 'rods') {
            this.boardArea.querySelectorAll('.rod-wire').forEach(w => w.classList.add('intro-spotlight-wire'));
            const midRod = this.rodElements[this.model.middleRodIndex];
            if (midRod) {
                this.showCalloutBadge(midRod.upperCol, label, 'top');
            }
        } else if (partName === 'all-clear') {
            this.frame.classList.add('intro-spotlight-frame');
        }
    }

    clearIntroHighlights() {
        if (this.frame) this.frame.classList.remove('intro-spotlight-frame');
        if (this.upperDeck) this.upperDeck.classList.remove('intro-spotlight-deck');
        if (this.beam) this.beam.classList.remove('intro-spotlight-beam');
        if (this.lowerDeck) this.lowerDeck.classList.remove('intro-spotlight-deck');
        if (this.boardArea) {
            this.boardArea.querySelectorAll('.rod-wire').forEach(w => w.classList.remove('intro-spotlight-wire'));
        }
        if (this.spotlightOverlay) {
            this.spotlightOverlay.innerHTML = '';
        }
    }

    showCalloutBadge(targetElem, label, pos = 'top') {
        if (!this.spotlightOverlay || !targetElem) return;
        this.spotlightOverlay.innerHTML = '';

        const badge = document.createElement('div');
        badge.className = `intro-callout-badge pos-${pos}`;
        badge.innerHTML = `<span class="badge-dot-glow"></span><span class="badge-text">${label}</span>`;
        this.spotlightOverlay.appendChild(badge);

        const frameRect = this.frame.getBoundingClientRect();
        const targetRect = targetElem.getBoundingClientRect();

        const relLeft = targetRect.left - frameRect.left + (targetRect.width / 2);
        const relTop = targetRect.top - frameRect.top;

        badge.style.left = `${relLeft}px`;
        if (pos === 'top') {
            badge.style.top = `${relTop - 34}px`;
        } else if (pos === 'bottom') {
            badge.style.top = `${relTop + targetRect.height + 12}px`;
        } else if (pos === 'center') {
            badge.style.top = `${relTop - 28}px`;
        } else if (pos === 'top-left') {
            badge.style.left = '50px';
            badge.style.top = '-18px';
        }
    }

    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        const container = document.querySelector('.virtual-abacus-app');
        if (container) {
            container.setAttribute('data-theme', themeName);
            container.className = `virtual-abacus-app theme-${themeName}`;
        }
        if (this.frame) {
            this.frame.setAttribute('data-theme', themeName);
            this.frame.className = `soroban-frame theme-${themeName}`;
        }
    }
}

if (typeof window !== "undefined") {
    window.AbacusRenderer = AbacusRenderer;
}

export { AbacusRenderer };
export default AbacusRenderer;
