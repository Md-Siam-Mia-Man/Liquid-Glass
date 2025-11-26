import { GlassElement } from './glass-element.js';

// Auto-register the element
if (!customElements.get('glass-element')) {
    customElements.define('glass-element', GlassElement);
}

// Export class if user wants to extend it
export { GlassElement };
