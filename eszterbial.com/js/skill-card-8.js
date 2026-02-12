// JavaScript - Fully scoped to #skill-card-8
(function() {
    'use strict';
    
    // ===== CONFIGURATION CONSTANTS =====
    const CONFIG = {
        GRID_SIZE: 5,              // Number of cells per row/column (20x20 = 400 cells)
        PROXIMITY_RADIUS: 3,        // Distance in grid units for grey effect
        BASE_COLOR: '#000000',      // Black background
        ACTIVE_COLOR: '#ffffff',    // White for hovered cell
        FADE_IN_DURATION: 200,      // Fast fade-in when hovering (ms)
        FADE_OUT_DURATION: 1200,    // Slow fade-out when leaving (ms)
        TRAIL_PERSISTENCE: 0.7,     // How much previous cells retain color (0-1)
    };
    
    // ===== GET ELEMENTS =====
    const card = document.getElementById('skill-card-8');
    if (!card) {
        console.error('skill-card-8 not found');
        return;
    }
    
    const interactive = card.querySelector('.skill-interactive');
    const gridContainer = card.querySelector('.grid');
    
    if (!interactive || !gridContainer) {
        console.error('Required elements not found in skill-card-8');
        return;
    }
    
    // ===== SETUP GRID LAYOUT =====
    gridContainer.style.gridTemplateColumns = `repeat(${CONFIG.GRID_SIZE}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${CONFIG.GRID_SIZE}, 1fr)`;
    
    // ===== CREATE GRID CELLS =====
    const cells = [];
    
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            gridContainer.appendChild(cell);
            
            cells.push({
                element: cell,
                row: row,
                col: col,
                currentIntensity: 0,  // Track current brightness for smooth transitions
                targetIntensity: 0    // Target brightness
            });
        }
    }
    
    console.log(`Generated ${cells.length} grid cells (${CONFIG.GRID_SIZE}x${CONFIG.GRID_SIZE})`);
    
    // ===== STATE =====
    let isHovering = false;
    let currentHoveredCell = null;
    let previousHoveredCells = new Set(); // Track recently hovered cells for trail effect
    
    // ===== CALCULATE GRID DISTANCE =====
    // Uses Chebyshev distance (max of horizontal and vertical distance)
    function getGridDistance(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return Math.max(rowDiff, colDiff);
    }
    
    // ===== CALCULATE INTENSITY (0-1) BASED ON DISTANCE =====
    function getProximityIntensity(distance) {
        if (distance === 0) {
            return 1.0; // Full white for exact cell
        }
        
        if (distance > CONFIG.PROXIMITY_RADIUS) {
            return 0; // Black for far cells
        }
        
        // Calculate intensity: closer = lighter, farther = darker
        const normalizedDistance = distance / CONFIG.PROXIMITY_RADIUS;
        
        // Exponential falloff for smoother gradient
        const intensity = Math.pow(1 - normalizedDistance, 2.5);
        
        return intensity;
    }
    
    // ===== CONVERT INTENSITY TO COLOR =====
    function intensityToColor(intensity) {
        if (intensity <= 0) return CONFIG.BASE_COLOR;
        if (intensity >= 1) return CONFIG.ACTIVE_COLOR;
        
        // Convert to grey value (0-255)
        const greyValue = Math.floor(intensity * 255);
        
        // Return as hex color
        const hex = greyValue.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`;
    }
    
    // ===== UPDATE GRID BASED ON CURSOR POSITION =====
    function updateGrid(hoveredRow, hoveredCol) {
        const currentCellKey = `${hoveredRow}-${hoveredCol}`;
        
        cells.forEach(cell => {
            const distance = getGridDistance(hoveredRow, hoveredCol, cell.row, cell.col);
            const cellKey = `${cell.row}-${cell.col}`;
            
            // Calculate target intensity
            let targetIntensity = getProximityIntensity(distance);
            
            // Check if this cell was recently hovered (trail effect)
            if (previousHoveredCells.has(cellKey) && distance > 0) {
                // Blend current intensity with previous to create smooth trail
                targetIntensity = Math.max(targetIntensity, cell.currentIntensity * CONFIG.TRAIL_PERSISTENCE);
            }
            
            // Determine transition speed based on whether we're lighting up or fading
            const isLightingUp = targetIntensity > cell.currentIntensity;
            
            if (distance === 0) {
                // Exact hovered cell - fast response
                cell.element.classList.add('active');
                cell.element.classList.remove('fading');
            } else if (isLightingUp) {
                // Lighting up - fast transition
                cell.element.classList.remove('fading');
                cell.element.classList.remove('active');
            } else {
                // Fading out - slow transition
                cell.element.classList.add('fading');
                cell.element.classList.remove('active');
            }
            
            // Update intensity tracking
            cell.targetIntensity = targetIntensity;
            cell.currentIntensity = targetIntensity;
            
            // Apply color
            const color = intensityToColor(targetIntensity);
            cell.element.style.backgroundColor = color;
            
            // Track this cell as previously hovered if it's in proximity
            if (distance <= CONFIG.PROXIMITY_RADIUS) {
                previousHoveredCells.add(cellKey);
            }
        });
        
        // Clean up old trail cells (keep only recent ones)
        if (previousHoveredCells.size > 50) {
            const cellsArray = Array.from(previousHoveredCells);
            previousHoveredCells = new Set(cellsArray.slice(-50));
        }
    }
    
    // ===== RESET GRID TO BLACK =====
    function resetGrid() {
        cells.forEach(cell => {
            cell.element.classList.add('fading');
            cell.element.classList.remove('active');
            cell.element.style.backgroundColor = CONFIG.BASE_COLOR;
            cell.currentIntensity = 0;
            cell.targetIntensity = 0;
        });
        
        // Clear trail after a delay
        setTimeout(() => {
            previousHoveredCells.clear();
        }, CONFIG.FADE_OUT_DURATION);
    }
    
    // ===== GET CELL FROM MOUSE POSITION =====
    function getCellFromMousePosition(e) {
        const rect = gridContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate which cell the mouse is over
        const cellWidth = rect.width / CONFIG.GRID_SIZE;
        const cellHeight = rect.height / CONFIG.GRID_SIZE;
        
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);
        
        // Bounds check
        if (row >= 0 && row < CONFIG.GRID_SIZE && col >= 0 && col < CONFIG.GRID_SIZE) {
            return { row, col };
        }
        
        return null;
    }
    
    // ===== EVENT HANDLERS =====
    function handleMouseEnter() {
        isHovering = true;
        console.log('Mouse entered skill-card-8 grid');
    }
    
    function handleMouseLeave() {
        isHovering = false;
        currentHoveredCell = null;
        resetGrid();
        console.log('Mouse left skill-card-8 grid');
    }
    
    function handleMouseMove(e) {
        if (!isHovering) return;
        
        const cell = getCellFromMousePosition(e);
        
        if (!cell) return;
        
        // Update on every move for smooth trail effect
        currentHoveredCell = cell;
        updateGrid(cell.row, cell.col);
    }
    
    // ===== ATTACH EVENT LISTENERS =====
    interactive.addEventListener('mouseenter', handleMouseEnter);
    interactive.addEventListener('mouseleave', handleMouseLeave);
    interactive.addEventListener('mousemove', handleMouseMove);
    
    console.log('Event listeners attached to skill-card-8');
    
    // ===== HANDLE WINDOW RESIZE =====
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isHovering && currentHoveredCell) {
                updateGrid(currentHoveredCell.row, currentHoveredCell.col);
            }
        }, 200);
    });
    
})();