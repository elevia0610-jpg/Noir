const card2 = document.getElementById('skill-card-2');
if (card2) {
    const container = document.querySelector('#skill-card-2 .skill-interactive');
    const squaresContainer = document.querySelector('.squares-stack');

    // Clear existing squares
    squaresContainer.innerHTML = '';

    let lastX = null;
    let lastY = null;
    let zIndexCounter = 1;
    const SPACING = 10; // Fixed distance between squares for dense trail

    function createSquare(x, y) {
        const div = document.createElement('div');
        div.className = 'square';
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.style.zIndex = zIndexCounter++;
        squaresContainer.appendChild(div);
    }

    function drawLine(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= SPACING) {
            const angle = Math.atan2(dy, dx);
            const stepX = Math.cos(angle) * SPACING;
            const stepY = Math.sin(angle) * SPACING;

            let currentX = x1;
            let currentY = y1;
            let distRemaining = distance;

            while (distRemaining >= SPACING) {
                currentX += stepX;
                currentY += stepY;
                createSquare(currentX, currentY);
                distRemaining -= SPACING;
            }
        }
    }

    function drawInitialX() {
        const rect = container.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        // Draw center square
        createSquare(cx, cy);

        // Draw 4 arms from center to corners
        // Drawing outwards ensures outer squares are on top (higher z-index)
        drawLine(cx, cy, 0, 0); // Top-Left
        drawLine(cx, cy, rect.width, 0); // Top-Right
        drawLine(cx, cy, rect.width, rect.height); // Bottom-Right
        drawLine(cx, cy, 0, rect.height); // Bottom-Left
    }

    // Draw initial pattern after a short delay to ensure layout is stable
    setTimeout(drawInitialX, 100);

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (lastX === null) {
            lastX = currentX;
            lastY = currentY;
            createSquare(currentX, currentY);
            return;
        }

        const dx = currentX - lastX;
        const dy = currentY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Interpolate to fill gaps regardless of speed
        if (distance >= SPACING) {
            const angle = Math.atan2(dy, dx);
            const stepX = Math.cos(angle) * SPACING;
            const stepY = Math.sin(angle) * SPACING;

            let distRemaining = distance;

            while (distRemaining >= SPACING) {
                lastX += stepX;
                lastY += stepY;
                createSquare(lastX, lastY);
                distRemaining -= SPACING;
            }
        }
    });

    container.addEventListener('mouseleave', () => {
        lastX = null;
        lastY = null;
    });
}