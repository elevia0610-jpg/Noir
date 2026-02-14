/**
 * Interactive Smiley Element
 * - Follows cursor with smooth morphing when hovering
 * - Shows wavy, organic movement when idle
 * - Detects hover via bounding box, works even when behind other elements
 */

class InteractiveSmiley {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }

        // Configuration
        this.config = {
            // Hover interaction
            maxRotation: 5,        // Maximum rotation in degrees
            maxScale: 1.5,         // Maximum scale factor
            maxSkew: 5,             // Maximum skew in degrees
            smoothness: 0.01,       // Lower = smoother (0-1)
            
            // Idle animation
            waveSpeed: 0.0015,       // Speed of wavy movement
            waveAmplitude: {
                rotation: 5,        // Rotation wave amplitude
                scale: 0.4,        // Scale wave amplitude
                translateX: 5,     // Horizontal movement
                translateY: 5,     // Vertical movement
            }
        };

        // State
        this.state = {
            isHovering: false,
            mouseX: 0.5,           // Normalized mouse position (0-1)
            mouseY: 0.5,
            currentTransform: {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                skewX: 0,
                skewY: 0
            },
            targetTransform: {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                skewX: 0,
                skewY: 0
            },
            time: 0
        };

        this.animationFrame = null;

        this.init();
    }

    init() {
        // Set transform origin
        this.element.style.transformOrigin = 'center center';
        this.element.style.willChange = 'transform';

        // KEY FIX: Use mousemove on document to detect hover via bounding box
        // This works even when other elements are on top (higher z-index)
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Start animation loop
        this.animate();
    }

    handleMouseMove(e) {
        // Get the element's position in the viewport
        const rect = this.element.getBoundingClientRect();

        // Check if cursor is inside the bounding box
        const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                      e.clientY >= rect.top  && e.clientY <= rect.bottom;

        // Calculate normalized mouse position (0-1)
        if (inside) {
            this.state.mouseX = (e.clientX - rect.left) / rect.width;
            this.state.mouseY = (e.clientY - rect.top) / rect.height;
        }

        // Update hover state
        if (inside !== this.state.isHovering) {
            this.state.isHovering = inside;
            
            // Optional: Toggle custom cursor class if it exists
            const customCursor = document.querySelector('.custom-cursor');
            if (customCursor) {
                customCursor.classList.toggle('hovering', inside);
            }
        }
    }

    calculateHoverTransform() {
        // Normalize to -1 to 1 range (center = 0)
        const normalizedX = (this.state.mouseX - 0.5) * 2;
        const normalizedY = (this.state.mouseY - 0.5) * 2;

        // Calculate transforms based on cursor position
        return {
            x: normalizedX * 20,  // Translate horizontally
            y: normalizedY * 20,  // Translate vertically
            rotation: normalizedX * this.config.maxRotation,  // Rotate based on X
            scale: 1 + (Math.abs(normalizedX) + Math.abs(normalizedY)) / 2 * (this.config.maxScale - 1),
            skewX: normalizedY * this.config.maxSkew,  // Skew based on Y
            skewY: -normalizedX * this.config.maxSkew   // Skew based on X
        };
    }

    calculateIdleTransform(time) {
        // Multiple sine waves for organic movement
        const t = time * this.config.waveSpeed;
        
        return {
            x: Math.sin(t * 1.3) * this.config.waveAmplitude.translateX + 
               Math.sin(t * 2.1) * this.config.waveAmplitude.translateX * 0.5,
            y: Math.cos(t * 1.7) * this.config.waveAmplitude.translateY + 
               Math.cos(t * 2.3) * this.config.waveAmplitude.translateY * 0.5,
            rotation: Math.sin(t * 1.1) * this.config.waveAmplitude.rotation + 
                     Math.sin(t * 1.9) * this.config.waveAmplitude.rotation * 0.3,
            scale: 1 + Math.sin(t * 0.9) * this.config.waveAmplitude.scale + 
                   Math.cos(t * 1.5) * this.config.waveAmplitude.scale * 0.5,
            skewX: Math.sin(t * 1.4) * 2,
            skewY: Math.cos(t * 1.6) * 2
        };
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        this.state.time += 1;

        // Calculate target transform based on hover state
        if (this.state.isHovering) {
            this.state.targetTransform = this.calculateHoverTransform();
        } else {
            this.state.targetTransform = this.calculateIdleTransform(this.state.time);
        }

        // Smooth interpolation
        this.state.currentTransform.x = this.lerp(
            this.state.currentTransform.x,
            this.state.targetTransform.x,
            this.config.smoothness
        );
        this.state.currentTransform.y = this.lerp(
            this.state.currentTransform.y,
            this.state.targetTransform.y,
            this.config.smoothness
        );
        this.state.currentTransform.rotation = this.lerp(
            this.state.currentTransform.rotation,
            this.state.targetTransform.rotation,
            this.config.smoothness
        );
        this.state.currentTransform.scale = this.lerp(
            this.state.currentTransform.scale,
            this.state.targetTransform.scale,
            this.config.smoothness
        );
        this.state.currentTransform.skewX = this.lerp(
            this.state.currentTransform.skewX,
            this.state.targetTransform.skewX,
            this.config.smoothness
        );
        this.state.currentTransform.skewY = this.lerp(
            this.state.currentTransform.skewY,
            this.state.targetTransform.skewY,
            this.config.smoothness
        );

        // Apply transforms
        const { x, y, rotation, scale, skewX, skewY } = this.state.currentTransform;
        
        this.element.style.transform = `
            translate(${x}px, ${y}px)
            rotate(${rotation}deg)
            scale(${scale})
            skew(${skewX}deg, ${skewY}deg)
        `;

        // Continue animation loop
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize for the smiley-graphic element
    const smileyGraphic = document.querySelector('.smiley-graphic');
    
    if (smileyGraphic) {
        // Add an ID if it doesn't have one
        if (!smileyGraphic.id) {
            smileyGraphic.id = 'interactive-smiley';
        }
        
        const interactiveSmiley = new InteractiveSmiley('interactive-smiley');
        
        // Make it accessible globally if needed
        window.interactiveSmiley = interactiveSmiley;
    }
});