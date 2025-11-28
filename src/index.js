import { GlassElement } from './glass-element.js';

// Auto-register the element
// This allows you to just import the script and use <glass-element> immediately
if (typeof customElements !== 'undefined' && !customElements.get('glass-element')) {
    customElements.define('glass-element', GlassElement);
}

// Export class if user wants to extend it or register manually
export { GlassElement };