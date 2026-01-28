// ABOUTME: Mobile static icons for skill cards (replaces interactive animations)
// ABOUTME: Activates below 768px viewport width - shows simple SVG icons instead

(function() {
    const isMobile = () => window.innerWidth <= 768;

    if (!isMobile()) return;

    const beige = '#e6e1dd';
    const black = '#1a1a1a';

    function createIconWrapper(svgContent) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-icon-wrapper';
        wrapper.innerHTML = `<svg class="mobile-icon" viewBox="0 0 100 100">${svgContent}</svg>`;
        return wrapper;
    }

    // Card 1 - Simple circle
    const card1 = document.querySelector('#skill-card-1');
    if (card1) {
        const wrapper = createIconWrapper(`<circle cx="50" cy="50" r="45" fill="${beige}"/>`);
        card1.insertBefore(wrapper, card1.querySelector('.skill-name'));
    }

    // Card 2 - Simple square
    const card2 = document.querySelector('#skill-card-2');
    if (card2) {
        const wrapper = createIconWrapper(`<rect x="10" y="10" width="80" height="80" fill="${beige}"/>`);
        card2.insertBefore(wrapper, card2.querySelector('.skill-name'));
    }

    // Card 3 - Grid of squares (4x4)
    const card3 = document.querySelector('#skill-card-3');
    if (card3) {
        let rects = '';
        const gap = 4;
        const size = (100 - gap * 5) / 4;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = gap + col * (size + gap);
                const y = gap + row * (size + gap);
                rects += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${beige}"/>`;
            }
        }
        const wrapper = createIconWrapper(rects);
        card3.insertBefore(wrapper, card3.querySelector('.skill-name'));
    }

    // Card 4 - Sunburst pattern
    const card4 = document.querySelector('#skill-card-4');
    if (card4) {
        const rays = 24;
        const center = 50;
        const radius = 48;
        let paths = '';

        for (let i = 0; i < rays; i++) {
            const startAngle = (i * 360 / rays) * Math.PI / 180;
            const endAngle = ((i + 1) * 360 / rays) * Math.PI / 180;
            const x1 = center + Math.cos(startAngle) * radius;
            const y1 = center + Math.sin(startAngle) * radius;
            const x2 = center + Math.cos(endAngle) * radius;
            const y2 = center + Math.sin(endAngle) * radius;
            const color = i % 2 === 0 ? beige : black;
            paths += `<path d="M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z" fill="${color}"/>`;
        }

        const wrapper = createIconWrapper(paths);
        card4.insertBefore(wrapper, card4.querySelector('.skill-name'));
    }

    // Card 5 - Rectangle matrix (horizontal rectangles)
    const card5 = document.querySelector('#skill-card-5');
    if (card5) {
        let rects = '';
        const rows = 5;
        const cols = 8;
        const gap = 3;
        const rectWidth = (100 - gap * (cols + 1)) / cols;
        const rectHeight = (100 - gap * (rows + 1)) / rows * 0.5;
        const rowHeight = (100 - gap) / rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = gap + col * (rectWidth + gap);
                const y = gap + row * rowHeight + (rowHeight - rectHeight) / 2;
                rects += `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" fill="${beige}"/>`;
            }
        }

        const wrapper = createIconWrapper(rects);
        card5.insertBefore(wrapper, card5.querySelector('.skill-name'));
    }
})();