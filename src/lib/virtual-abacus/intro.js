/**
 * Introduction & Interactive Anatomy Tour for Virtual Soroban Abacus
 * Points directly to all 5 parts on the abacus with arrows and labels:
 * 1. Frame
 * 2. Upper Beads
 * 3. Beam (Answer Line)
 * 4. Lower Beads
 * 5. Rods
 * Plus interactive buttons for:
 * - Touch All Beads to Beam
 * - Set to Zero (Watch Animated Hands slide along beam)
 */

class AbacusIntro {
    constructor(model, renderer) {
        this.model = model;
        this.renderer = renderer;
        this.isActive = false;

        this.initDOM();
    }

    initDOM() {
        const introBtn = document.getElementById('open-intro-btn');
        if (introBtn) {
            introBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        const closeBtn = document.getElementById('banner-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        const touchAllBtn = document.getElementById('banner-touch-all-btn');
        if (touchAllBtn) {
            touchAllBtn.addEventListener('click', () => {
                this.renderer.touchAllBeadsToBeam();
            });
        }

        const setZeroBtn = document.getElementById('banner-set-zero-btn');
        if (setZeroBtn) {
            setZeroBtn.addEventListener('click', () => {
                this.renderer.animateSetToZeroWithHands();
            });
        }
    }

    start() {
        this.isActive = true;
        const banner = document.getElementById('anatomy-guide-banner');
        if (banner) {
            banner.classList.remove('hidden');
            banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (this.renderer) {
            this.renderer.showAnatomyPointers();
        }
    }

    close() {
        this.isActive = false;
        const banner = document.getElementById('anatomy-guide-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
        if (this.renderer) {
            this.renderer.hideAnatomyPointers();
        }
    }

    toggle() {
        if (this.isActive) {
            this.close();
        } else {
            this.start();
        }
    }
}

if (typeof window !== "undefined") {
    window.AbacusIntro = AbacusIntro;
}

export { AbacusIntro };
export default AbacusIntro;
