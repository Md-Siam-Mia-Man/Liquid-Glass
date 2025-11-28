import { getDisplacementMap, getDisplacementFilter } from './utils.js';

export class GlassElement extends HTMLElement {
    constructor() {
        super();
        this.clicked = false;
        // Bind the method so we can remove it later
        this.handleResize = this.updateResponsiveSize.bind(this);
        this.resizeTimeout = null;
        this.attachShadow({ mode: 'open' });

        if (GlassElement._svgFilterSupport === undefined) {
            GlassElement._svgFilterSupport = this.detectSVGFilterSupport();
        }
    }

    /**
     * Detection for SVG Filter support in Backdrop Filter.
     * Chromium-based browsers (Chrome, Edge, Arc, Brave) support this best.
     */
    detectSVGFilterSupport() {
        const userAgent = navigator.userAgent.toLowerCase();
        // Check for Chromium based browsers. 
        // We exclude Firefox and Safari explicitly as they support backdrop-filter 
        // but NOT with SVG url() references yet.
        const isChromium = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios|safari/.test(userAgent);

        // Edge case: "safari" string often appears in Chrome UA, so we double check
        const isRealChrome = isChromium && !/version\/[\d\.]+.*safari/.test(userAgent);

        return isChromium || isRealChrome;
    }

    get hasSVGFilterSupport() {
        return GlassElement._svgFilterSupport;
    }

    static get observedAttributes() {
        return [
            'width', 'height', 'radius', 'depth', 'blur', 'strength',
            'chromatic-aberration', 'debug', 'background-color',
            'responsive', 'base-width', 'base-height',
            'auto-size', 'min-width', 'min-height',
            'saturate', 'brightness' // Added new controls
        ];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupResponsive();

        if (this.autoSize) {
            this.setupAutoSizeObserver();
        }
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }

    setupAutoSizeObserver() {
        this.mutationObserver = new MutationObserver(() => {
            // Debounce slightly to prevent layout thrashing
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.updateStyles(), 10);
        });

        this.mutationObserver.observe(this, { childList: true, subtree: true, characterData: true });

        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.updateStyles());
            this.resizeObserver.observe(this.shadowRoot.querySelector('.glass-box'));
        }
    }

    setupResponsive() {
        if (this.hasAttribute('responsive')) {
            this.updateResponsiveSize();
            window.addEventListener('resize', this.handleResize);
        }
    }

    updateResponsiveSize() {
        const baseWidth = parseInt(this.getAttribute('base-width') || this.getAttribute('width')) || 200;
        const baseHeight = parseInt(this.getAttribute('base-height') || this.getAttribute('height')) || 200;

        const viewport = window.innerWidth;
        let scale = 1;

        if (viewport < 480) scale = 0.6;
        else if (viewport < 768) scale = 0.8;
        else if (viewport < 1024) scale = 0.9;

        const newWidth = Math.round(baseWidth * scale);
        const newHeight = Math.round(baseHeight * scale);

        if (newWidth !== this.width || newHeight !== this.height) {
            this.setAttribute('width', newWidth);
            this.setAttribute('height', newHeight);
        }
    }

    attributeChangedCallback() {
        if (this.shadowRoot) this.updateStyles();
    }

    // --- Getters ---
    get width() { return parseInt(this.getAttribute('width')) || 200; }
    get height() { return parseInt(this.getAttribute('height')) || 200; }
    get radius() { return parseInt(this.getAttribute('radius')) || 25; }
    get baseDepth() { return parseInt(this.getAttribute('depth')) || 10; }
    get blur() { return parseInt(this.getAttribute('blur')) || 5; }
    get strength() { return parseInt(this.getAttribute('strength')) || 20; }
    get chromaticAberration() { return parseInt(this.getAttribute('chromatic-aberration')) || 0; }
    get debug() { return this.getAttribute('debug') === 'true'; }
    get autoSize() { return this.hasAttribute('auto-size'); }
    get minWidth() { return parseInt(this.getAttribute('min-width')) || 0; }
    get minHeight() { return parseInt(this.getAttribute('min-height')) || 0; }

    // Updated Defaults for "Us" project look
    get backgroundColor() { return this.getAttribute('background-color') || 'rgba(255, 255, 255, 0.1)'; }
    get saturate() { return parseFloat(this.getAttribute('saturate')) || 1.1; }
    get brightness() { return parseFloat(this.getAttribute('brightness')) || 1.1; }

    // Dynamic Depth based on click
    get depth() { return this.baseDepth / (this.clicked ? 0.6 : 1); }

    setupEventListeners() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');

        const setClicked = (state) => {
            this.clicked = state;
            this.updateStyles();
        };

        glassBox.addEventListener('mousedown', () => setClicked(true));
        glassBox.addEventListener('mouseup', () => setClicked(false));
        glassBox.addEventListener('mouseleave', () => setClicked(false));
        glassBox.addEventListener('touchstart', () => setClicked(true), { passive: true });
        glassBox.addEventListener('touchend', () => setClicked(false));
    }

    updateStyles() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (glassBox) this.applyDynamicStyles(glassBox);
    }

    applyDynamicStyles(element) {
        element.style.borderRadius = `${this.radius}px`;

        let actualWidth = this.width;
        let actualHeight = this.height;

        if (this.autoSize) {
            element.style.backdropFilter = 'none';
            element.style.background = 'transparent';

            // Force reflow
            element.offsetWidth;

            const rect = element.getBoundingClientRect();
            actualWidth = Math.ceil(rect.width);
            actualHeight = Math.ceil(rect.height);

            if (actualWidth === 0 || actualHeight === 0) {
                // DOM might not be ready, retry next frame
                requestAnimationFrame(() => this.updateStyles());
                return;
            }

            actualWidth = Math.max(actualWidth, this.minWidth, 50);
            actualHeight = Math.max(actualHeight, this.minHeight, 30);
        } else {
            element.style.height = `${this.height}px`;
            element.style.width = `${this.width}px`;
        }

        const commonBoxShadow = `
            inset 0 0 0 1px rgba(255,255,255, 0.2), 
            0 15px 35px -10px rgba(0,0,0, 0.15)
        `;

        if (this.debug) {
            element.style.background = `url("${getDisplacementMap({
                height: actualHeight, width: actualWidth, radius: this.radius, depth: this.depth
            })}")`;
            element.style.backgroundSize = 'cover';
            element.style.boxShadow = "none";
            element.style.backdropFilter = "none";
        } else if (!this.hasSVGFilterSupport) {
            // Fallback for Safari/Firefox
            element.style.backdropFilter = `blur(${Math.max(10, this.blur)}px)`;
            element.style.background = this.backgroundColor.replace(/[\d.]+\)$/, '0.5)'); // Force more opacity
            element.style.boxShadow = commonBoxShadow;
            element.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        } else {
            // FIX: Removed the second blur that was washing out the effect
            element.style.backdropFilter = `
                blur(${this.blur}px) 
                url('${getDisplacementFilter({
                height: actualHeight,
                width: actualWidth,
                radius: this.radius,
                depth: this.depth,
                strength: this.strength,
                chromaticAberration: this.chromaticAberration
            })}') 
                brightness(${this.brightness}) 
                saturate(${this.saturate})
            `;
            element.style.background = this.backgroundColor;
            element.style.boxShadow = commonBoxShadow;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { 
                    display: ${this.autoSize ? 'inline-block' : 'block'}; 
                    vertical-align: middle;
                }
                .glass-box {
                    background: rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    box-sizing: border-box;
                    ${this.autoSize ? `display: inline-block; width: fit-content; min-width: ${this.minWidth}px; min-height: ${this.minHeight}px;` : ''}
                }
                .glass-box:active { transform: scale(0.98); }
                .content {
                    position: relative;
                    z-index: 2;
                    ${this.autoSize ? '' : 'width: 100%; height: 100%;'}
                    ${this.autoSize ? 'padding: var(--glass-padding, 0);' : ''}
                }
            </style>
            <div class="glass-box">
                <div class="content"><slot></slot></div>
            </div>
        `;

        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (this.autoSize) {
            // Double animation frame ensures DOM is fully painted before calculating size
            requestAnimationFrame(() => requestAnimationFrame(() => this.applyDynamicStyles(glassBox)));
        } else {
            this.applyDynamicStyles(glassBox);
        }
    }
}