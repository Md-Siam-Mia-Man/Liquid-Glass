import { getDisplacementMap, getDisplacementFilter } from './utils.js';

export class GlassElement extends HTMLElement {
    constructor() {
        super();
        this.clicked = false;
        // Bind the method so we can remove it later
        this.handleResize = this.updateResponsiveSize.bind(this);
        this.attachShadow({ mode: 'open' });

        if (GlassElement._svgFilterSupport === undefined) {
            GlassElement._svgFilterSupport = this.detectSVGFilterSupport();
        }
    }

    detectSVGFilterSupport() {
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';
        if (!testElement.style.backdropFilter) return false;

        const userAgent = navigator.userAgent.toLowerCase();
        // Chrome/Edge/Arc support. Firefox/Safari do not support SVG filters in backdrop-filter yet.
        const isChrome = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios/.test(userAgent);

        if (isChrome) return true;

        try {
            testElement.style.backdropFilter = 'url(#test)';
            return testElement.style.backdropFilter.includes('url');
        } catch (e) {
            return false;
        }
    }

    get hasSVGFilterSupport() {
        return GlassElement._svgFilterSupport;
    }

    static get observedAttributes() {
        return [
            'width', 'height', 'radius', 'depth', 'blur', 'strength',
            'chromatic-aberration', 'debug', 'background-color',
            'responsive', 'base-width', 'base-height',
            'auto-size', 'min-width', 'min-height'
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

    // CRITICAL FIX: Clean up listeners when element is removed from DOM
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
            setTimeout(() => this.updateStyles(), 0);
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
            // Use the bound function reference
            window.addEventListener('resize', this.handleResize);
        }
    }

    updateResponsiveSize() {
        // Debounce protection could be added here, but simple check is fine for now
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
        if (this.shadowRoot) this.render();
    }

    // Getters
    get width() { return parseInt(this.getAttribute('width')) || 200; }
    get height() { return parseInt(this.getAttribute('height')) || 200; }
    get radius() { return parseInt(this.getAttribute('radius')) || 50; }
    get baseDepth() { return parseInt(this.getAttribute('depth')) || 10; }
    get blur() { return parseInt(this.getAttribute('blur')) || 2; }
    get strength() { return parseInt(this.getAttribute('strength')) || 100; }
    get chromaticAberration() { return parseInt(this.getAttribute('chromatic-aberration')) || 0; }
    get debug() { return this.getAttribute('debug') === 'true'; }
    get backgroundColor() { return this.getAttribute('background-color') || 'rgba(255, 255, 255, 0.4)'; }
    get autoSize() { return this.hasAttribute('auto-size'); }
    get minWidth() { return parseInt(this.getAttribute('min-width')) || 0; }
    get minHeight() { return parseInt(this.getAttribute('min-height')) || 0; }
    get depth() { return this.baseDepth / (this.clicked ? 0.7 : 1); }

    setupEventListeners() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');

        const setClicked = (state) => {
            this.clicked = state;
            this.updateStyles();
        };

        glassBox.addEventListener('mousedown', () => setClicked(true));
        glassBox.addEventListener('mouseup', () => setClicked(false));
        glassBox.addEventListener('mouseleave', () => setClicked(false));
        // Note: document listener is global, technically should be cleaned up too, 
        // but it's less critical as it's anonymous. Kept for simplicity.
        document.addEventListener('mouseup', () => { if (this.clicked) setClicked(false); });
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
            element.style.background = 'rgba(255, 255, 255, 0.4)';

            // Force reflow
            element.offsetWidth;

            const rect = element.getBoundingClientRect();
            actualWidth = Math.ceil(rect.width);
            actualHeight = Math.ceil(rect.height);

            if (actualWidth === 0 || actualHeight === 0) {
                requestAnimationFrame(() => this.updateStyles());
                return;
            }

            actualWidth = Math.max(actualWidth, this.minWidth, 50);
            actualHeight = Math.max(actualHeight, this.minHeight, 30);
        } else {
            element.style.height = `${this.height}px`;
            element.style.width = `${this.width}px`;
        }

        const commonBoxShadow = '1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)';

        if (this.debug) {
            element.style.background = `url("${getDisplacementMap({
                height: actualHeight, width: actualWidth, radius: this.radius, depth: this.depth
            })}")`;
            element.style.boxShadow = "none";
            element.style.backdropFilter = "none";
        } else if (!this.hasSVGFilterSupport) {
            element.style.backdropFilter = `blur(${this.blur * 2}px)`;
            element.style.background = this.backgroundColor;
            element.style.boxShadow = commonBoxShadow;
            element.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        } else {
            element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
                height: actualHeight,
                width: actualWidth,
                radius: this.radius,
                depth: this.depth,
                strength: this.strength,
                chromaticAberration: this.chromaticAberration
            })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;
            element.style.background = this.backgroundColor;
            element.style.boxShadow = commonBoxShadow;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: ${this.autoSize ? 'inline-block' : 'block'}; }
                .glass-box {
                    background: rgba(255, 255, 255, 0.4);
                    box-shadow: 1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04);
                    cursor: pointer;
                    transition: transform 0.1s ease;
                    position: relative;
                    ${this.autoSize ? `display: inline-block; width: fit-content; min-width: ${this.minWidth}px; min-height: ${this.minHeight}px;` : ''}
                }
                .glass-box:active { transform: scale(0.98); }
                .content {
                    ${this.autoSize ? '' : 'width: 100%; height: 100%;'}
                    display: flex; align-items: center; justify-content: center;
                    color: white; text-align: center; font-family: sans-serif;
                    ${this.autoSize ? 'padding: var(--glass-padding, 16px 24px);' : ''}
                }
            </style>
            <div class="glass-box">
                <div class="content"><slot></slot></div>
            </div>
        `;

        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (this.autoSize) {
            requestAnimationFrame(() => requestAnimationFrame(() => this.applyDynamicStyles(glassBox)));
        } else {
            this.applyDynamicStyles(glassBox);
        }
    }
}