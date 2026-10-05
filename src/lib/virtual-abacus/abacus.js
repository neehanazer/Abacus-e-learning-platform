/**
 * Core Abacus Logic & State Engine
 * Manages bead positions, rod place-values, and mathematical conversions.
 */

class AbacusModel {
    constructor(rodCount = 17) {
        this.rodCount = rodCount;
        this.mode = 'standard'; // 'standard' (with decimals on right) or 'integer' (whole numbers)
        this.rods = [];
        this.initRods();
    }

    setRodCount(count) {
        if (count < 5 || count > 21) return;
        this.rodCount = count;
        this.initRods();
    }

    initRods() {
        this.rods = [];
        this.middleRodIndex = Math.floor(this.rodCount / 2); // Center rod is the Units (1s) rod

        for (let i = 0; i < this.rodCount; i++) {
            const exponent = this.middleRodIndex - i;
            this.rods.push({
                index: i,
                upperActive: false, // 1 bead, value 5 (down = active)
                lowerCount: 0,      // 0..4 beads, value 1 each (up = active)
                exponent: exponent, // power of 10: 0 for units, >0 for left, <0 for right
                multiplier: Math.pow(10, exponent),
                name: this.getPlaceName(exponent),
                shortName: this.getShortPlaceName(exponent),
                hasDot: this.isDotRod(i)
            });
        }
    }

    // Determine which rods have the 5 white reckoner dots
    isDotRod(index) {
        const center = this.middleRodIndex;
        // On 13 rods: [0, 3, 6, 9, 12] (5 dots, middle is 6)
        // On 15 rods: [1, 4, 7, 10, 13] (5 dots, middle is 7)
        // On 17 rods: [2, 5, 8, 11, 14] (5 dots, middle is 8)
        const offset = Math.abs(index - center);
        return offset % 3 === 0 && Math.abs(index - center) <= 6;
    }

    getPlaceName(exponent) {
        if (exponent === 0) return 'Units (1s)';
        if (exponent === 1) return 'Tens (10s)';
        if (exponent === 2) return 'Hundreds (100s)';
        if (exponent === 3) return 'Thousands (1,000s)';
        if (exponent === 4) return 'Ten Thousands (10,000s)';
        if (exponent === 5) return 'Hundred Thousands / Lakhs (100,000s)';
        if (exponent === 6) return 'Millions / 10 Lakhs (1,000,000s)';
        if (exponent === 7) return 'Ten Millions / Crores (10,000,000s)';
        if (exponent === 8) return 'Hundred Millions (100,000,000s)';
        if (exponent === -1) return 'Tenths (0.1)';
        if (exponent === -2) return 'Hundredths (0.01)';
        if (exponent === -3) return 'Thousandths (0.001)';
        if (exponent === -4) return 'Ten-Thousandths (0.0001)';
        if (exponent === -5) return 'Hundred-Thousandths (0.00001)';
        if (exponent === -6) return 'Millionths (0.000001)';
        return exponent > 0 ? `10^${exponent}` : `10^(${exponent})`;
    }

    getShortPlaceName(exponent) {
        if (exponent === 0) return '1';
        if (exponent === 1) return '10';
        if (exponent === 2) return '100';
        if (exponent === 3) return '1K';
        if (exponent === 4) return '10K';
        if (exponent === 5) return '100K';
        if (exponent === 6) return '1M';
        if (exponent === 7) return '10M';
        if (exponent === 8) return '100M';
        if (exponent === -1) return '.1';
        if (exponent === -2) return '.01';
        if (exponent === -3) return '.001';
        if (exponent === -4) return '.0001';
        return `10^${exponent}`;
    }

    // Toggle or set upper bead (5)
    toggleUpper(rodIndex) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return false;
        const rod = this.rods[rodIndex];
        rod.upperActive = !rod.upperActive;
        return rod.upperActive;
    }

    setUpper(rodIndex, active) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return;
        this.rods[rodIndex].upperActive = !!active;
    }

    // Move lower bead group
    // Clicking bead index i (0 = top-most lower bead near beam, 3 = bottom-most lower bead)
    // If clicking an active bead, it deactivates that bead and beads below it.
    // If clicking an inactive bead, it activates that bead and beads above it.
    clickLowerBead(rodIndex, beadIndex) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return 0;
        const rod = this.rods[rodIndex];
        const currentActive = rod.lowerCount; // 0..4

        // beadIndex: 0 is closest to beam (top lower bead), 3 is furthest (bottom lower bead)
        // Active beads are 0, 1, ..., (lowerCount - 1)
        if (beadIndex < currentActive) {
            // Bead is currently active -> deactivate it and all lower beads below it
            rod.lowerCount = beadIndex;
        } else {
            // Bead is currently inactive -> activate it and all lower beads above it
            rod.lowerCount = beadIndex + 1;
        }
        return rod.lowerCount;
    }

    setLowerCount(rodIndex, count) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return;
        this.rods[rodIndex].lowerCount = Math.max(0, Math.min(4, count));
    }

    getRodDigit(rodIndex) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return 0;
        const rod = this.rods[rodIndex];
        return (rod.upperActive ? 5 : 0) + rod.lowerCount;
    }

    setRodValue(rodIndex, digit) {
        if (rodIndex < 0 || rodIndex >= this.rodCount) return;
        digit = Math.max(0, Math.min(9, Math.floor(digit)));
        const rod = this.rods[rodIndex];
        if (digit >= 5) {
            rod.upperActive = true;
            rod.lowerCount = digit - 5;
        } else {
            rod.upperActive = false;
            rod.lowerCount = digit;
        }
    }

    // Clear all beads to 0
    reset() {
        for (const rod of this.rods) {
            rod.upperActive = false;
            rod.lowerCount = 0;
        }
    }

    // Set all beads to touch the reckoning beam / answer line
    // Upper beads move DOWN to beam, Lower beads move UP to beam
    touchAllBeadsToBeam() {
        for (const rod of this.rods) {
            rod.upperActive = true;
            rod.lowerCount = 4;
        }
    }

    // Compute total abacus value
    getTotalValue() {
        let integerPart = 0;
        let decimalPart = 0;

        for (let i = 0; i <= this.middleRodIndex; i++) {
            const digit = this.getRodDigit(i);
            const exp = this.middleRodIndex - i;
            integerPart += digit * Math.pow(10, exp);
        }

        for (let i = this.middleRodIndex + 1; i < this.rodCount; i++) {
            const digit = this.getRodDigit(i);
            const exp = this.middleRodIndex - i;
            decimalPart += digit * Math.pow(10, exp);
        }

        // Round to avoid floating-point artifact
        const total = integerPart + decimalPart;
        return parseFloat(total.toFixed(6));
    }

    // Formatted string representation for the LCD display
    getFormattedValue() {
        const val = this.getTotalValue();
        const [intStr, decStr] = val.toString().split('.');
        const formattedInt = Number(intStr).toLocaleString('en-US');
        if (decStr && decStr !== '0' && decStr !== '') {
            return `${formattedInt}.${decStr}`;
        }
        return formattedInt;
    }

    // Expanded place value breakdown
    getExpandedBreakdown() {
        const breakdown = [];
        for (let i = 0; i < this.rodCount; i++) {
            const digit = this.getRodDigit(i);
            if (digit > 0) {
                const rod = this.rods[i];
                const rawVal = digit * Math.pow(10, rod.exponent);
                breakdown.push({
                    rodIndex: i,
                    digit: digit,
                    name: rod.name,
                    shortName: rod.shortName,
                    isUnits: i === this.middleRodIndex,
                    exponent: rod.exponent,
                    value: parseFloat(rawVal.toFixed(6))
                });
            }
        }
        return breakdown;
    }

    // Set entire abacus to a specific number
    setTotalNumber(num) {
        this.reset();
        if (typeof num !== 'number' || isNaN(num) || num < 0) return;

        const str = num.toString();
        const [intStr, decStr = ''] = str.split('.');

        // Set integer digits from Units rod going left
        const intDigits = intStr.split('').reverse();
        for (let i = 0; i < intDigits.length; i++) {
            const rodIdx = this.middleRodIndex - i;
            if (rodIdx >= 0) {
                this.setRodValue(rodIdx, parseInt(intDigits[i], 10));
            }
        }

        // Set decimal digits from Units + 1 going right
        const decDigits = decStr.split('');
        for (let i = 0; i < decDigits.length; i++) {
            const rodIdx = this.middleRodIndex + 1 + i;
            if (rodIdx < this.rodCount) {
                this.setRodValue(rodIdx, parseInt(decDigits[i], 10));
            }
        }
    }
}

if (typeof window !== "undefined") {
    window.AbacusModel = AbacusModel;
}

export { AbacusModel };
export default AbacusModel;
