const skillCard6 = document.getElementById("skill-card-6");

if (skillCard6) {
    const container = skillCard6.querySelector(".skill-interactive");
    const canvas = container.querySelector("#skill-card-6-canvas");
    const ctx = canvas.getContext("2d");

    let width, height;
    const squareSize = 20;
    const grid = [];
    let mouse = { x: -9999, y: -9999 };

    function resizeCanvas() {
        width = canvas.width = container.clientWidth;
        height = canvas.height = container.clientHeight;
        initGrid();
    }

    function initGrid() {
        grid.length = 0;
        for (let x = 0; x < width; x += squareSize) {
            for (let y = 0; y < height; y += squareSize) {
                grid.push({
                    x,
                    y,
                    alpha: 0,
                    fading: false,
                    lastTouched: 0
                });
            }
        }
    }

    function getCellAt(x, y) {
        return grid.find(cell =>
            x >= cell.x && x < cell.x + squareSize &&
            y >= cell.y && y < cell.y + squareSize
        );
    }

    container.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        const cell = getCellAt(mouse.x, mouse.y);
        if (cell && cell.alpha === 0) {
            cell.alpha = 1;
            cell.lastTouched = Date.now();
            cell.fading = false;
        }
    });

    container.addEventListener("mouseleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function drawGrid() {
        ctx.clearRect(0, 0, width, height);
        const now = Date.now();

        for (const cell of grid) {
            if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 500) {
                cell.fading = true;
            }

            if (cell.fading) {
                cell.alpha -= 0.01;
                if (cell.alpha <= 0) {
                    cell.alpha = 0;
                    cell.fading = false;
                }
            }

            if (cell.alpha > 0) {
                const cx = cell.x + squareSize / 2;
                const cy = cell.y + squareSize / 2;

                const gradient = ctx.createRadialGradient(
                    cx, cy, 5,
                    cx, cy, squareSize
                );

                gradient.addColorStop(0, `rgba(211,208,206, ${cell.alpha})`);
                gradient.addColorStop(1, `rgba(230, 225, 221, 0)`);


                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.3;
                ctx.strokeRect(
                    cell.x + 0.5,
                    cell.y + 0.5,
                    squareSize - 1,
                    squareSize - 1
                );
            }
        }

        requestAnimationFrame(drawGrid);
    }

    resizeCanvas();
    drawGrid();
    window.addEventListener("resize", resizeCanvas);
}
