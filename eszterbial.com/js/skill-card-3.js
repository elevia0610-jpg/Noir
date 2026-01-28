const card3 = document.getElementById('skill-card-3');

if (card3) {
    const container = card3.querySelector('.skill-interactive');

    // Configuration
    const pixelSize = 20; // Size of each pixel in px

    function createGrid() {
        // Clear existing
        container.innerHTML = '';

        // Get dimensions
        const rect = container.getBoundingClientRect();
        const cols = Math.ceil(rect.width / pixelSize);
        const rows = Math.ceil(rect.height / pixelSize);

        // Set grid styles
        container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        const totalPixels = cols * rows;

        // Create pixels
        for (let i = 0; i < totalPixels; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel-square');
            container.appendChild(pixel);

            // Interaction
            pixel.addEventListener('mouseenter', () => {
                gsap.to(pixel, {
                    opacity: 0,
                    scale: 0.5,
                    duration: 0.1,
                    overwrite: true,
                    onComplete: () => {
                        // Random recovery time between 1 and 3 seconds
                        gsap.to(pixel, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            delay: Math.random() * 2 + 1,
                            ease: "power2.out"
                        });
                    }
                });
            });
        }
    }

    // Initialize grid
    // Use ResizeObserver to handle responsive resizing
    const resizeObserver = new ResizeObserver(entries => {
        // Simple debounce could be added here if needed
        window.requestAnimationFrame(() => {
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                createGrid();
            }
        });
    });

    resizeObserver.observe(container);
}