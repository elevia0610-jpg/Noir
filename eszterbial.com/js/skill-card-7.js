// JavaScript - Fully scoped to #skill-card-7
(function() {
    'use strict';
    
    // Configuration constants (easily tunable)
    const CONFIG = {
        BAR_COUNT: 28,           // Number of bars
        BASE_HEIGHT: 0.12,       // Minimum bar height (scaleY)
        MAX_HEIGHT: 0.95,        // Maximum bar height (scaleY)
        ACTIVATION_RADIUS: 90,   // Cursor influence radius (px)
        Y_INFLUENCE: 0.4,        // How much Y position affects intensity (0-1)
        FLUCTUATION_SPEED: 0.003, // Speed of organic motion
        FLUCTUATION_AMOUNT: 0.12, // Amount of random variation
    };
    
    // Get the specific card container
    const card = document.getElementById('skill-card-7');
    if (!card) {
        console.error('skill-card-7 not found');
        return;
    }
    
    const interactive = card.querySelector('.skill-interactive');
    const barsContainer = card.querySelector('.bars');
    
    if (!interactive || !barsContainer) {
        console.error('Required elements not found');
        return;
    }
    
    // Generate bars
    const bars = [];
    for (let i = 0; i < CONFIG.BAR_COUNT; i++) {
        const bar = document.createElement('span');
        barsContainer.appendChild(bar);
        bars.push({
            element: bar,
            baseOffset: Math.random() * Math.PI * 2,
            weight: 0.85 + Math.random() * 0.3
        });
    }
    
    // State
    let isHovering = false;
    let mouseX = 0;
    let mouseY = 0;
    let animationTime = 0;
    let animationFrame = null;
    let barPositions = [];
    
    // Get bar positions
    function getBarPositions() {
        const containerRect = interactive.getBoundingClientRect();
        return bars.map((bar) => {
            const barRect = bar.element.getBoundingClientRect();
            return {
                x: barRect.left + barRect.width / 2 - containerRect.left
            };
        });
    }
    
    // Wait for layout to complete before calculating positions
    setTimeout(() => {
        barPositions = getBarPositions();
    }, 100);
    
    // Calculate distance-based influence
    function calculateInfluence(barX, mouseX, mouseY, containerHeight) {
        const distance = Math.abs(barX - mouseX);
        
        if (distance > CONFIG.ACTIVATION_RADIUS) return 0;
        
        // Falloff curve
        const proximityFactor = 1 - (distance / CONFIG.ACTIVATION_RADIUS);
        const smoothFactor = Math.pow(proximityFactor, 1.8);
        
        // Y position influence
        const yNormalized = mouseY / containerHeight;
        const yFactor = 1 - (yNormalized * CONFIG.Y_INFLUENCE);
        
        return smoothFactor * Math.max(0.3, yFactor);
    }
    
    // Animation loop
    function animate() {
        if (!isHovering) return;
        
        animationTime += CONFIG.FLUCTUATION_SPEED;
        const containerHeight = interactive.offsetHeight;
        
        bars.forEach((bar, i) => {
            if (!barPositions[i]) return;
            
            const barPos = barPositions[i];
            const influence = calculateInfluence(barPos.x, mouseX, mouseY, containerHeight);
            
            // Organic fluctuation
            const fluctuation = Math.sin(animationTime + bar.baseOffset) * CONFIG.FLUCTUATION_AMOUNT;
            const organicInfluence = influence + (influence * fluctuation);
            
            // Calculate final height
            const targetHeight = CONFIG.BASE_HEIGHT + 
                (CONFIG.MAX_HEIGHT - CONFIG.BASE_HEIGHT) * organicInfluence * bar.weight;
            
            bar.element.style.transform = `scaleY(${Math.max(CONFIG.BASE_HEIGHT, Math.min(CONFIG.MAX_HEIGHT, targetHeight))})`;
        });
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // Event handlers
    function handleMouseEnter() {
        isHovering = true;
        barPositions = getBarPositions();
        if (!animationFrame) {
            animate();
        }
    }
    
    function handleMouseLeave() {
        isHovering = false;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        
        bars.forEach(bar => {
            bar.element.style.transform = `scaleY(${CONFIG.BASE_HEIGHT})`;
        });
    }
    
    function handleMouseMove(e) {
        const rect = interactive.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
    
    // Attach event listeners
    interactive.addEventListener('mouseenter', handleMouseEnter);
    interactive.addEventListener('mouseleave', handleMouseLeave);
    interactive.addEventListener('mousemove', handleMouseMove);
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            barPositions = getBarPositions();
        }, 200);
    });
    
})();