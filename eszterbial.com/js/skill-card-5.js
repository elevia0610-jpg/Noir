// ABOUTME: Skill card 5 - Horizontal stripes of rectangles that rotate near mouse
// ABOUTME: Op-art Bridget Riley style effect with brain-melting rotation animation

const card5 = document.querySelector('.skill-card:last-child');

if (card5) {
    const container = card5.querySelector('.skill-interactive');
    card5.id = 'skill-card-5';

    const canvas = document.createElement('canvas');
    canvas.classList.add('doodle-canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const cols = 18;
    const rows = 14;
    const effectRadius = 140;

    let cells = [];
    let targetX = -999;
    let targetY = -999;
    let currentX = -999;
    let currentY = -999;

    function initCells() {
        cells = [];
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                cells.push({
                    x: col * cellWidth + cellWidth / 2,
                    y: row * cellHeight + cellHeight / 2,
                    width: cellWidth - 1,
                    height: cellHeight * 0.5,
                    rotation: 0
                });
            }
        }
    }

    function render() {
        // Smooth follow
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f4f1eb';

        cells.forEach(cell => {
            const dx = cell.x - currentX;
            const dy = cell.y - currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Target rotation based on distance
            let targetRot = 0;
            if (dist < effectRadius) {
                const effect = Math.pow(1 - dist / effectRadius, 1.5);
                // Rotate based on angle to create spiral effect
                const angle = Math.atan2(dy, dx);
                targetRot = effect * (Math.PI / 2 + angle * 0.3);
            }

            // Smooth rotation
            cell.rotation += (targetRot - cell.rotation) * 0.18;

            // Draw rotated rectangle
            ctx.save();
            ctx.translate(cell.x, cell.y);
            ctx.rotate(cell.rotation);

            ctx.fillRect(-cell.width / 2, -cell.height / 2,
                cell.width,
                cell.height
            );

            ctx.restore();
        });

        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initCells();
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        targetX = -999;
        targetY = -999;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        targetX = touch.clientX - rect.left;
        targetY = touch.clientY - rect.top;
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        targetX = -999;
        targetY = -999;
    });

    const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                resizeCanvas();
            }
        });
    });

    resizeObserver.observe(container);
    resizeCanvas();
    requestAnimationFrame(render);
}