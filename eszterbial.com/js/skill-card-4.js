// ABOUTME: Sunburst pattern effect for skill card 4
// ABOUTME: Creates a 5x5 grid with sunburst, individual cells rotate when hovered

(function() {
    const container = document.querySelector('#skill-card-4 .skill-interactive');
    if (!container) return;

    const GRID_SIZE = 5;
    const RAYS = 36;

    // Get CSS colors
    const styles = getComputedStyle(document.documentElement);
    const beige = styles.getPropertyValue('--soft-beige').trim() || '#F5F0E8';
    const black = styles.getPropertyValue('--black').trim() || '#1a1a1a';

    // Create SVG sunburst pattern with color inversion option
    function createSunburstSVG(invertColors) {
        const size = 500;
        const center = size / 2;
        const radius = size * 0.75;

        let paths = '';
        for (let i = 0; i < RAYS; i++) {
            const startAngle = (i * 360 / RAYS) * Math.PI / 180;
            const endAngle = ((i + 1) * 360 / RAYS) * Math.PI / 180;

            const x1 = center + Math.cos(startAngle) * radius;
            const y1 = center + Math.sin(startAngle) * radius;
            const x2 = center + Math.cos(endAngle) * radius;
            const y2 = center + Math.sin(endAngle) * radius;

            let color;
            if (invertColors) {
                color = i % 2 === 0 ? black : beige;
            } else {
                color = i % 2 === 0 ? beige : black;
            }
            paths += `<path d="M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z" fill="${color}"/>`;
        }

        return `<svg viewBox="0 0 ${size} ${size}" preserveAspectRatio="none">${paths}</svg>`;
    }

    // Create grid cells
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'sunburst-cell';

            const invertColors = (row + col) % 2 === 1;
            cell.innerHTML = createSunburstSVG(invertColors);

            const svg = cell.querySelector('svg');
            svg.style.left = `-${col * 100}%`;
            svg.style.top = `-${row * 100}%`;

            // Track rotation state
            let currentRotation = 0;
            let resetTimeout = null;

            cell.addEventListener('mouseenter', () => {
                if (resetTimeout) {
                    clearTimeout(resetTimeout);
                    resetTimeout = null;
                }

                currentRotation += 90;
                gsap.to(cell, {
                    rotation: currentRotation,
                    duration: 0.5,
                    ease: "back.out(1.7)"
                });
            });

            cell.addEventListener('mouseleave', () => {
                resetTimeout = setTimeout(() => {
                    gsap.to(cell, {
                        rotation: 0,
                        duration: 0.4,
                        ease: "power2.inOut",
                        onComplete: () => {
                            currentRotation = 0;
                        }
                    });
                }, 800);
            });

            container.appendChild(cell);
        }
    }
})();