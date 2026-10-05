/**
 * Audio Synthesizer for Virtual Abacus
 * Uses Web Audio API to create authentic wood clack & sliding sounds
 * without needing external audio files.
 */

class AbacusAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.7;
        this.lastSoundTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
    }

    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Play crisp wooden bead impact sound
    playBeadClick(isUpper = false, isActivating = true, intensity = 1.0) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Limit rapid repeat jitter
        if (now - this.lastSoundTime < 0.015) return;
        this.lastSoundTime = now;

        // Base frequency: upper beads slightly lower pitch (larger feel), lower beads crisp
        const baseFreq = isUpper ? (isActivating ? 620 : 540) : (isActivating ? 780 : 700);
        const pitchVariance = (Math.random() - 0.5) * 60;
        const freq = baseFreq + pitchVariance;

        // Create oscillator for the resonant tap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.04);

        // Filter for organic wooden thud
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.2, now);
        filter.Q.setValueAtTime(3.5, now);

        // Amplitude envelope: quick sharp transient, fast decay
        const peakGain = 0.35 * this.volume * Math.min(1.5, Math.max(0.4, intensity));
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(peakGain, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        // Noise transient for wooden texture
        this.playWoodNoise(now, peakGain * 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Short burst of filtered noise for tactile friction
    playWoodNoise(time, gainLevel) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.03; // 30ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, time);
        filter.Q.setValueAtTime(2.0, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainLevel * 0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(time);
        noise.stop(time + 0.035);
    }

    // Play multiple staggered clacks for the quick reset bar
    playResetSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const count = 10;
        for (let i = 0; i < count; i++) {
            const delay = (i / count) * 0.18 + Math.random() * 0.02;
            setTimeout(() => {
                this.playBeadClick(i % 2 === 0, false, 0.7 + Math.random() * 0.5);
            }, delay * 1000);
        }

        // Add a deeper frame clack at the end
        setTimeout(() => {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

            gain.gain.setValueAtTime(0.3 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        }, 190);
    }

    // Success chime for quiz / challenge mode
    playSuccessSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        });
    }

    // Subtle error tone
    playErrorSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);

        gain.gain.setValueAtTime(0.15 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
    }
}

const abacusAudio = typeof window !== "undefined" ? (window.abacusAudio || new AbacusAudio()) : new AbacusAudio();
if (typeof window !== "undefined") {
    window.abacusAudio = abacusAudio;
    window.AbacusAudio = AbacusAudio;
}

export { AbacusAudio, abacusAudio };
export default abacusAudio;
