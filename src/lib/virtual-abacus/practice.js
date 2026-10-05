/**
 * Practice, Challenge, and Flash Anzan Module for Virtual Abacus
 * Handles "Set Number" Challenge, "Read Abacus" Quiz, and "Flash Anzan" Mental Math.
 */

class AbacusPractice {
    constructor(model, renderer) {
        this.model = model;
        this.renderer = renderer;

        this.currentMode = 'free'; // 'free', 'challenge-set', 'quiz-read', 'flash-anzan'
        
        // Challenge State
        this.challengeLevel = 2; // 1: 1-digit, 2: 2-digit, 3: 3-digit, 4: 4-digit, 5: Decimals
        this.challengeTarget = 0;
        this.challengeScore = 0;
        this.challengeStreak = 0;
        this.challengeTimerSeconds = 0;
        this.challengeTimerInterval = null;

        // Quiz State
        this.quizLevel = 2;
        this.quizTarget = 0;
        this.quizScore = 0;
        this.quizStreak = 0;
        this.quizTimerSeconds = 0;
        this.quizTimerInterval = null;

        // Flash Anzan State
        this.anzanScore = 0;
        this.anzanStreak = 0;
        this.anzanNumbers = [];
        this.anzanSum = 0;
        this.anzanRunning = false;
        this.anzanInterval = null;

        this.initUI();
    }

    initUI() {
        // --- 1. Mode 2: "Set Number" Challenge ---
        const challengeLevelBtns = document.querySelectorAll('#challenge-level-btns .level-btn');
        challengeLevelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                challengeLevelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.challengeLevel = parseInt(btn.dataset.level, 10) || 2;
                this.generateNewChallengeTask();
            });
        });

        const challengeCheckBtn = document.getElementById('challenge-check-btn');
        if (challengeCheckBtn) {
            challengeCheckBtn.addEventListener('click', () => this.checkChallengeBeads());
        }

        const challengeHintBtn = document.getElementById('challenge-hint-btn');
        if (challengeHintBtn) {
            challengeHintBtn.addEventListener('click', () => this.showChallengeHint());
        }

        const challengeSkipBtn = document.getElementById('challenge-skip-btn');
        if (challengeSkipBtn) {
            challengeSkipBtn.addEventListener('click', () => this.generateNewChallengeTask());
        }

        // --- 2. Mode 3: "Read Abacus" Quiz ---
        const quizLevelBtns = document.querySelectorAll('#quiz-level-btns .level-btn');
        quizLevelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                quizLevelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.quizLevel = parseInt(btn.dataset.level, 10) || 2;
                this.generateNewQuizTask();
            });
        });

        const quizSubmitBtn = document.getElementById('quiz-read-submit-btn');
        const quizInput = document.getElementById('quiz-read-input');
        if (quizSubmitBtn && quizInput) {
            quizSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitQuizAnswer();
            });
            quizInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitQuizAnswer();
                }
            });
        }

        const quizHintBtn = document.getElementById('quiz-hint-btn');
        if (quizHintBtn) {
            quizHintBtn.addEventListener('click', () => this.showQuizHint());
        }

        const quizSkipBtn = document.getElementById('quiz-skip-btn');
        if (quizSkipBtn) {
            quizSkipBtn.addEventListener('click', () => this.generateNewQuizTask());
        }

        // --- 3. Mode 4: Flash Anzan ---
        const anzanStartBtn = document.getElementById('anzan-start-btn');
        if (anzanStartBtn) {
            anzanStartBtn.addEventListener('click', () => this.startFlashAnzan());
        }

        const anzanCheckBtn = document.getElementById('anzan-check-btn');
        const anzanInput = document.getElementById('anzan-user-answer');
        if (anzanCheckBtn && anzanInput) {
            anzanCheckBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.checkAnzanAnswer();
            });
            anzanInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.checkAnzanAnswer();
                }
            });
        }
    }

    // Switch active mode panel
    setMode(mode) {
        this.currentMode = mode;
        this.stopAllTimers();

        const freePanel = document.getElementById('free-play-panel');
        const challengePanel = document.getElementById('challenge-set-panel');
        const quizPanel = document.getElementById('quiz-read-panel');
        const anzanPanel = document.getElementById('flash-anzan-panel');

        if (freePanel) freePanel.classList.add('hidden');
        if (challengePanel) challengePanel.classList.add('hidden');
        if (quizPanel) quizPanel.classList.add('hidden');
        if (anzanPanel) anzanPanel.classList.add('hidden');

        // Restore normal abacus LCD display by default
        this.unmaskLCD();

        if (mode === 'free') {
            if (freePanel) freePanel.classList.remove('hidden');
            this.renderer.updateView();
        } else if (mode === 'challenge-set') {
            if (challengePanel) challengePanel.classList.remove('hidden');
            this.startChallengeSession();
        } else if (mode === 'quiz-read') {
            if (quizPanel) quizPanel.classList.remove('hidden');
            this.startQuizSession();
        } else if (mode === 'flash-anzan') {
            if (anzanPanel) anzanPanel.classList.remove('hidden');
            this.resetAnzanScreen();
        }
    }

    stopAllTimers() {
        if (this.challengeTimerInterval) {
            clearInterval(this.challengeTimerInterval);
            this.challengeTimerInterval = null;
        }
        if (this.quizTimerInterval) {
            clearInterval(this.quizTimerInterval);
            this.quizTimerInterval = null;
        }
        if (this.anzanInterval) {
            clearInterval(this.anzanInterval);
            this.anzanInterval = null;
        }
        this.anzanRunning = false;
    }

    maskLCD(text = '🔒 Read the Beads!') {
        const lcd = document.getElementById('main-value-display');
        if (lcd) {
            lcd.textContent = text;
            lcd.style.fontSize = '22px';
            lcd.style.color = '#f59e0b';
        }
    }

    unmaskLCD() {
        const lcd = document.getElementById('main-value-display');
        if (lcd) {
            lcd.style.fontSize = '';
            lcd.style.color = '';
            lcd.textContent = this.model.getFormattedValue();
        }
    }

    // Helper: generate random numbers per level
    getRandomTargetNumber(level) {
        switch (level) {
            case 1: // 1-digit (1..9)
                return Math.floor(Math.random() * 9) + 1;
            case 2: // 2-digit (10..99)
                return Math.floor(Math.random() * 90) + 10;
            case 3: // 3-digit (100..999)
                return Math.floor(Math.random() * 900) + 100;
            case 4: // 4-digit (1000..9999)
                return Math.floor(Math.random() * 9000) + 1000;
            case 5: // Decimals (e.g. 14.5, 82.3)
                const intPart = Math.floor(Math.random() * 90) + 10;
                const decPart = Math.floor(Math.random() * 9) + 1;
                return parseFloat(`${intPart}.${decPart}`);
            default:
                return Math.floor(Math.random() * 90) + 10;
        }
    }

    formatNumber(num) {
        return num.toLocaleString('en-US');
    }

    showConfetti() {
        const frame = document.getElementById('soroban-frame');
        if (!frame) return;

        const container = document.createElement('div');
        container.className = 'confetti-burst';
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-particle';
            p.style.setProperty('--x', `${(Math.random() - 0.5) * 450}px`);
            p.style.setProperty('--y', `${(Math.random() - 0.8) * 350}px`);
            p.style.setProperty('--bg', `hsl(${Math.random() * 360}, 95%, 60%)`);
            p.style.setProperty('--rot', `${Math.random() * 720}deg`);
            container.appendChild(p);
        }
        frame.appendChild(container);
        setTimeout(() => container.remove(), 1300);
    }

    /* ==========================================================================
       MODE 2: "SET NUMBER" CHALLENGE
       ========================================================================== */
    startChallengeSession() {
        this.challengeScore = 0;
        this.challengeStreak = 0;
        this.updateChallengeScoreboard();
        this.generateNewChallengeTask();
    }

    generateNewChallengeTask() {
        this.clearHints();
        this.challengeTarget = this.getRandomTargetNumber(this.challengeLevel);

        const targetElem = document.getElementById('challenge-target-val');
        if (targetElem) {
            targetElem.textContent = this.formatNumber(this.challengeTarget);
        }

        const feedbackElem = document.getElementById('challenge-feedback');
        if (feedbackElem) {
            feedbackElem.className = 'practice-feedback info';
            feedbackElem.innerHTML = `Move beads on the abacus to show: <strong>${this.formatNumber(this.challengeTarget)}</strong>`;
        }

        // Reset abacus beads to 0
        this.model.reset();
        this.renderer.updateView();

        // Start timer
        if (this.challengeTimerInterval) clearInterval(this.challengeTimerInterval);
        this.challengeTimerSeconds = 0;
        const timerElem = document.getElementById('challenge-timer');
        if (timerElem) timerElem.textContent = '0s';

        this.challengeTimerInterval = setInterval(() => {
            this.challengeTimerSeconds++;
            if (timerElem) timerElem.textContent = `${this.challengeTimerSeconds}s`;
        }, 1000);
    }

    // Called automatically when user moves beads in challenge mode
    onAbacusValueChange(val) {
        if (this.currentMode === 'challenge-set') {
            if (Math.abs(val - this.challengeTarget) < 0.0001) {
                this.handleChallengeSuccess();
            }
        }
    }

    checkChallengeBeads() {
        const curVal = this.model.getTotalValue();
        if (Math.abs(curVal - this.challengeTarget) < 0.0001) {
            this.handleChallengeSuccess();
        } else {
            const feedbackElem = document.getElementById('challenge-feedback');
            if (feedbackElem) {
                feedbackElem.className = 'practice-feedback error';
                feedbackElem.innerHTML = `Current beads show <strong>${curVal}</strong>. Needs <strong>${this.challengeTarget}</strong>. Keep going or tap 💡 Hint!`;
            }
            if (window.abacusAudio) window.abacusAudio.playErrorSound();
        }
    }

    handleChallengeSuccess() {
        if (this.challengeTimerInterval) {
            clearInterval(this.challengeTimerInterval);
            this.challengeTimerInterval = null;
        }

        const pts = Math.max(10, 35 - this.challengeTimerSeconds);
        this.challengeScore += pts;
        this.challengeStreak += 1;
        this.updateChallengeScoreboard();

        if (window.abacusAudio) window.abacusAudio.playSuccessSound();
        this.showConfetti();

        const feedbackElem = document.getElementById('challenge-feedback');
        if (feedbackElem) {
            feedbackElem.className = 'practice-feedback success';
            feedbackElem.innerHTML = `
                <div class="feedback-badge">🎉 PERFECT! YOU MATCHED ${this.formatNumber(this.challengeTarget)}!</div>
                <div class="feedback-sub">Solved in ${this.challengeTimerSeconds}s! +${pts} pts • Next challenge loading...</div>
            `;
        }

        setTimeout(() => {
            if (this.currentMode === 'challenge-set') {
                this.generateNewChallengeTask();
            }
        }, 1600);
    }

    showChallengeHint() {
        const curVal = this.model.getTotalValue();
        if (Math.abs(curVal - this.challengeTarget) < 0.0001) return;

        const str = this.challengeTarget.toString();
        const [intStr, decStr = ''] = str.split('.');
        const intDigits = intStr.split('').reverse();

        let hintMsg = '💡 <strong>Rod breakdown:</strong> ';
        for (let i = 0; i < intDigits.length; i++) {
            const rodIdx = this.model.middleRodIndex - i;
            const targetDigit = intDigits[i];
            const curDigit = this.model.getRodDigit(rodIdx);
            const rodName = this.model.rods[rodIdx].shortName;
            hintMsg += `<span style="margin-right:8px;">[${rodName}: set <strong>${targetDigit}</strong> (now ${curDigit})]</span>`;
        }

        const feedbackElem = document.getElementById('challenge-feedback');
        if (feedbackElem) {
            this.clearHints();
            const banner = document.createElement('div');
            banner.className = 'hint-banner';
            banner.innerHTML = hintMsg;
            feedbackElem.appendChild(banner);
        }
    }

    updateChallengeScoreboard() {
        const scoreElem = document.getElementById('challenge-score');
        const streakElem = document.getElementById('challenge-streak');
        if (scoreElem) scoreElem.textContent = this.challengeScore;
        if (streakElem) streakElem.textContent = `🔥 ${this.challengeStreak}`;
    }

    /* ==========================================================================
       MODE 3: "READ ABACUS" QUIZ
       ========================================================================== */
    startQuizSession() {
        this.quizScore = 0;
        this.quizStreak = 0;
        this.updateQuizScoreboard();
        this.generateNewQuizTask();
    }

    generateNewQuizTask() {
        this.clearHints();
        this.quizTarget = this.getRandomTargetNumber(this.quizLevel);

        // Configure abacus beads with quiz target
        this.model.setTotalNumber(this.quizTarget);
        this.renderer.updateView();

        // Mask LCD screen so the answer is hidden!
        this.maskLCD('🔒 Read the Beads!');

        const input = document.getElementById('quiz-read-input');
        if (input) {
            input.value = '';
            input.focus();
        }

        const feedbackElem = document.getElementById('quiz-feedback');
        if (feedbackElem) {
            feedbackElem.className = 'practice-feedback info';
            feedbackElem.innerHTML = `Look at the beads on the abacus and enter your answer above!`;
        }

        // Start timer
        if (this.quizTimerInterval) clearInterval(this.quizTimerInterval);
        this.quizTimerSeconds = 0;
        const timerElem = document.getElementById('quiz-timer');
        if (timerElem) timerElem.textContent = '0s';

        this.quizTimerInterval = setInterval(() => {
            this.quizTimerSeconds++;
            if (timerElem) timerElem.textContent = `${this.quizTimerSeconds}s`;
        }, 1000);
    }

    submitQuizAnswer() {
        const input = document.getElementById('quiz-read-input');
        if (!input) return;

        const valStr = input.value.trim();
        if (valStr === '') {
            const feedbackElem = document.getElementById('quiz-feedback');
            if (feedbackElem) {
                feedbackElem.className = 'practice-feedback error';
                feedbackElem.innerHTML = '⚠️ Please enter the number shown on the abacus!';
            }
            input.focus();
            return;
        }

        const userVal = parseFloat(valStr);
        if (isNaN(userVal)) {
            const feedbackElem = document.getElementById('quiz-feedback');
            if (feedbackElem) {
                feedbackElem.className = 'practice-feedback error';
                feedbackElem.innerHTML = '⚠️ Please type a valid numerical value!';
            }
            input.focus();
            return;
        }

        if (Math.abs(userVal - this.quizTarget) < 0.0001) {
            this.handleQuizSuccess();
        } else {
            this.handleQuizMistake(userVal);
        }
    }

    handleQuizSuccess() {
        if (this.quizTimerInterval) {
            clearInterval(this.quizTimerInterval);
            this.quizTimerInterval = null;
        }

        // Reveal number on LCD screen!
        this.unmaskLCD();

        const pts = Math.max(10, 35 - this.quizTimerSeconds);
        this.quizScore += pts;
        this.quizStreak += 1;
        this.updateQuizScoreboard();

        if (window.abacusAudio) window.abacusAudio.playSuccessSound();
        this.showConfetti();

        const feedbackElem = document.getElementById('quiz-feedback');
        if (feedbackElem) {
            feedbackElem.className = 'practice-feedback success';
            feedbackElem.innerHTML = `
                <div class="feedback-badge">🎉 CORRECT! The abacus shows ${this.formatNumber(this.quizTarget)}!</div>
                <div class="feedback-sub">Solved in ${this.quizTimerSeconds}s! +${pts} pts • Loading next problem...</div>
            `;
        }

        setTimeout(() => {
            if (this.currentMode === 'quiz-read') {
                this.generateNewQuizTask();
            }
        }, 1600);
    }

    handleQuizMistake(userVal) {
        this.quizStreak = 0;
        this.updateQuizScoreboard();

        if (window.abacusAudio) window.abacusAudio.playErrorSound();

        const input = document.getElementById('quiz-read-input');
        if (input) {
            input.classList.add('shake-error');
            setTimeout(() => input.classList.remove('shake-error'), 400);
            input.focus();
        }

        const feedbackElem = document.getElementById('quiz-feedback');
        if (feedbackElem) {
            feedbackElem.className = 'practice-feedback error';
            feedbackElem.innerHTML = `❌ You entered <strong>${userVal}</strong>. Check the active beads (Upper = 5, Lower = 1) and try again, or tap 💡 Hint!`;
        }
    }

    showQuizHint() {
        const str = this.quizTarget.toString();
        const [intStr, decStr = ''] = str.split('.');
        const intDigits = intStr.split('').reverse();

        let hintMsg = '💡 <strong>Bead hint:</strong> ';
        for (let i = 0; i < intDigits.length; i++) {
            const rodIdx = this.model.middleRodIndex - i;
            const digit = parseInt(intDigits[i], 10);
            const rodName = this.model.rods[rodIdx].shortName;
            const hasUpper = digit >= 5;
            const lowerCount = digit % 5;
            hintMsg += `<span style="margin-right:8px;">[${rodName}: ${hasUpper ? 'Upper active (5) + ' : ''}${lowerCount} Lower]</span>`;
        }

        const feedbackElem = document.getElementById('quiz-feedback');
        if (feedbackElem) {
            this.clearHints();
            const banner = document.createElement('div');
            banner.className = 'hint-banner';
            banner.innerHTML = hintMsg;
            feedbackElem.appendChild(banner);
        }
    }

    updateQuizScoreboard() {
        const scoreElem = document.getElementById('quiz-score');
        const streakElem = document.getElementById('quiz-streak');
        if (scoreElem) scoreElem.textContent = this.quizScore;
        if (streakElem) streakElem.textContent = `🔥 ${this.quizStreak}`;
    }

    /* ==========================================================================
       MODE 4: FLASH ANZAN (MENTAL MATH)
       ========================================================================== */
    resetAnzanScreen() {
        this.stopAllTimers();
        const screen = document.getElementById('anzan-screen');
        const answerArea = document.getElementById('anzan-answer-area');
        const feedback = document.getElementById('anzan-feedback');

        if (screen) {
            screen.innerHTML = `<span class="anzan-prompt">Select settings and press "⚡ Start Flash Test" to begin mental calculation!</span>`;
        }
        if (answerArea) answerArea.classList.add('hidden');
        if (feedback) feedback.classList.add('hidden');
    }

    startFlashAnzan() {
        if (this.anzanRunning) return;
        this.anzanRunning = true;

        const countSelect = document.getElementById('anzan-count-select');
        const speedSelect = document.getElementById('anzan-speed-select');
        const digitsSelect = document.getElementById('anzan-digits-select');

        const count = parseInt(countSelect?.value || '5', 10);
        const speedMs = parseInt(speedSelect?.value || '1200', 10);
        const digits = parseInt(digitsSelect?.value || '2', 10);

        // Generate series
        this.anzanNumbers = [];
        this.anzanSum = 0;

        const max = Math.pow(10, digits) - 1;
        const min = Math.pow(10, digits - 1);

        for (let i = 0; i < count; i++) {
            let n = Math.floor(Math.random() * (max - min + 1)) + min;
            // Occasional subtraction after first 2 numbers
            if (i > 1 && Math.random() > 0.65 && this.anzanSum > n) {
                n = -n;
            }
            this.anzanNumbers.push(n);
            this.anzanSum += n;
        }

        const screen = document.getElementById('anzan-screen');
        const answerArea = document.getElementById('anzan-answer-area');
        const feedback = document.getElementById('anzan-feedback');

        if (answerArea) answerArea.classList.add('hidden');
        if (feedback) feedback.classList.add('hidden');

        // 3-2-1 Countdown
        let countdown = 3;
        if (screen) screen.innerHTML = `<span class="anzan-countdown">${countdown}</span>`;
        if (window.abacusAudio) window.abacusAudio.playBeadClick(false, true, 0.9);

        const cdTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                if (screen) screen.innerHTML = `<span class="anzan-countdown">${countdown}</span>`;
                if (window.abacusAudio) window.abacusAudio.playBeadClick(false, true, 0.9);
            } else if (countdown === 0) {
                if (screen) screen.innerHTML = `<span class="anzan-countdown start">READY!</span>`;
                if (window.abacusAudio) window.abacusAudio.playBeadClick(true, true, 1.2);
            } else {
                clearInterval(cdTimer);
                this.displayAnzanSequence(speedMs, screen, answerArea);
            }
        }, 800);
    }

    displayAnzanSequence(speedMs, screen, answerArea) {
        let idx = 0;
        const showNext = () => {
            if (!this.anzanRunning) return;

            if (idx < this.anzanNumbers.length) {
                const num = this.anzanNumbers[idx];
                const sign = num > 0 ? (idx === 0 ? '' : '+') : '';
                if (screen) {
                    screen.innerHTML = `<span class="anzan-number ${num < 0 ? 'negative' : 'positive'}">${sign}${num}</span>`;
                }

                if (window.abacusAudio) {
                    window.abacusAudio.playBeadClick(num < 0, true, 1.2);
                }

                idx++;
                setTimeout(() => {
                    if (screen) screen.innerHTML = '';
                    setTimeout(showNext, speedMs * 0.2);
                }, speedMs * 0.8);
            } else {
                // Done flashing -> prompt for answer
                this.anzanRunning = false;
                if (screen) {
                    screen.innerHTML = `<span class="anzan-done">🤔 Enter Total Sum:</span>`;
                }
                if (answerArea) {
                    answerArea.classList.remove('hidden');
                    const input = document.getElementById('anzan-user-answer');
                    if (input) {
                        input.value = '';
                        input.focus();
                    }
                }
            }
        };

        showNext();
    }

    checkAnzanAnswer() {
        const input = document.getElementById('anzan-user-answer');
        const screen = document.getElementById('anzan-screen');
        const feedback = document.getElementById('anzan-feedback');
        if (!input || input.value.trim() === '') return;

        const userAns = parseInt(input.value.trim(), 10);
        if (isNaN(userAns)) return;

        // Build formula explanation: 45 + 12 - 5 = 52
        let formula = '';
        this.anzanNumbers.forEach((n, i) => {
            if (i === 0) formula += `${n}`;
            else if (n >= 0) formula += ` + ${n}`;
            else formula += ` - ${Math.abs(n)}`;
        });
        formula += ` = <strong>${this.anzanSum}</strong>`;

        if (userAns === this.anzanSum) {
            this.anzanScore += 30;
            this.anzanStreak += 1;
            this.updateAnzanScoreboard();

            if (screen) {
                screen.innerHTML = `<span class="anzan-success">🎉 EXCELLENT! SUM WAS ${this.anzanSum}</span>`;
            }
            if (feedback) {
                feedback.classList.remove('hidden');
                feedback.className = 'practice-feedback success';
                feedback.innerHTML = `
                    <div class="feedback-badge">🎉 CORRECT! (+30 pts)</div>
                    <div>Calculation: ${formula}</div>
                `;
            }
            if (window.abacusAudio) window.abacusAudio.playSuccessSound();
            this.showConfetti();
        } else {
            this.anzanStreak = 0;
            this.updateAnzanScoreboard();

            if (screen) {
                screen.innerHTML = `<span class="anzan-error">❌ Incorrect! Correct sum was ${this.anzanSum}</span>`;
            }
            if (feedback) {
                feedback.classList.remove('hidden');
                feedback.className = 'practice-feedback error';
                feedback.innerHTML = `
                    <div class="feedback-badge">❌ You answered ${userAns}.</div>
                    <div>Correct calculation: ${formula}</div>
                `;
            }
            if (window.abacusAudio) window.abacusAudio.playErrorSound();
        }
    }

    updateAnzanScoreboard() {
        const scoreElem = document.getElementById('anzan-score');
        const streakElem = document.getElementById('anzan-streak');
        if (scoreElem) scoreElem.textContent = this.anzanScore;
        if (streakElem) streakElem.textContent = `🔥 ${this.anzanStreak}`;
    }

    clearHints() {
        document.querySelectorAll('.hint-banner').forEach(el => el.remove());
    }
}

if (typeof window !== "undefined") {
    window.AbacusPractice = AbacusPractice;
}

export { AbacusPractice };
export default AbacusPractice;
