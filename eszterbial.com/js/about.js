// ABOUTME: JavaScript for the about page
// ABOUTME: Handles hero image split animation on scroll and smooth scrolling

// Initialize Lenis smooth scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Update ScrollTrigger on Lenis scroll
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Hero images split animation on scroll
function initHeroAnimation() {
    const image1 = document.querySelector('.about-hero-image-1');
    const image2 = document.querySelector('.about-hero-image-2');

    if (!image1 || !image2) return;

    // Smaller offset on mobile so images stay visible
    const isMobile = window.innerWidth <= 768;
    const xOffset = isMobile ? '35%' : '60%';
    const rotation = isMobile ? 15 : 20;

    // Create timeline for the split animation - very fast and dramatic
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-hero',
            start: 'top top',
            end: '15% top',
            scrub: 0.2,
            pin: false
        }
    });

    // Image 1 rotates left and moves left
    tl.to(image1, {
        rotation: -rotation,
        x: `-${xOffset}`,
        ease: 'none'
    }, 0);

    // Image 2 rotates right and moves right
    tl.to(image2, {
        rotation: rotation,
        x: xOffset,
        ease: 'none'
    }, 0);

    // Show bubble when images have split, hide when scrolling further down
    const bubble = document.querySelector('.about-hero-bubble');
    if (bubble) {
        ScrollTrigger.create({
            trigger: '.about-hero',
            start: '15% top',
            end: '80% top',
            onEnter: () => bubble.classList.add('visible'),
            onLeave: () => bubble.classList.remove('visible'),
            onEnterBack: () => bubble.classList.add('visible'),
            onLeaveBack: () => bubble.classList.remove('visible')
        });
    }
}

// Menu functionality
function initMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const menuCard = document.getElementById('menuCard');
    const closeBtn = document.getElementById('closeBtn');
    const menuLinks = document.querySelectorAll('.menu-link-inner');
    const menuSeparator = document.querySelector('.menu-separator');

    if (!menuBtn || !menuCard || !closeBtn) return;

    let isOpen = false;

    function openMenu() {
        if (isOpen) return;
        isOpen = true;

        gsap.to(menuCard, {
            visibility: 'visible',
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(menuLinks, {
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.2
        });

        gsap.fromTo(menuSeparator, {
            scaleX: 0
        }, {
            scaleX: 1,
            duration: 0.4,
            ease: 'power2.out',
            delay: 0.4
        });
    }

    function closeMenu() {
        if (!isOpen) return;
        isOpen = false;

        gsap.to(menuLinks, {
            y: '150%',
            duration: 0.3,
            stagger: 0.03,
            ease: 'power2.in'
        });

        gsap.to(menuSeparator, {
            scaleX: 0,
            duration: 0.2,
            ease: 'power2.in'
        });

        gsap.to(menuCard, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
            delay: 0.2,
            onComplete: () => {
                gsap.set(menuCard, {
                    visibility: 'hidden'
                });
            }
        });
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
}

// Custom cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Create hover bubble
    const hoverBubble = document.createElement('div');
    hoverBubble.classList.add('cursor-bubble');
    hoverBubble.textContent = 'hover me';
    document.body.appendChild(hoverBubble);

    // Create contact title follow cursor
    const contactTitleCursor = document.createElement('div');
    contactTitleCursor.className = 'contact-title-cursor';
    contactTitleCursor.innerHTML = `<img src="/assets/image/custom-cursor2.png" alt="">`;
    document.body.appendChild(contactTitleCursor);

    const skillCards = document.querySelectorAll('.skill-card');
    const contactTitle = document.querySelector('.contact-title');
    const hoverables = document.querySelectorAll('a, button, .menu-btn, .menu-link, .social-link, .contact-social-link, .download-cv-btn');
    let currentCard = null;

    // Contact title cursor variables
    let mouseX = 0;
    let mouseY = 0;
    let contactCursorX = 0;
    let contactCursorY = 0;
    let currentSkewX = 0;
    let currentSkewY = 0;
    let isOnContactTitle = false;

    // Smooth follow animation for contact title cursor using lerp
    function animateContactCursor() {
        if (isOnContactTitle) {
            const velocityX = mouseX - contactCursorX;
            const velocityY = mouseY - contactCursorY;

            contactCursorX += velocityX * 0.12;
            contactCursorY += velocityY * 0.12;

            const targetSkewX = Math.max(-15, Math.min(15, velocityX * 0.3));
            const targetSkewY = Math.max(-15, Math.min(15, velocityY * 0.3));

            currentSkewX += (targetSkewX - currentSkewX) * 0.15;
            currentSkewY += (targetSkewY - currentSkewY) * 0.15;

            contactTitleCursor.style.left = contactCursorX + 'px';
            contactTitleCursor.style.top = contactCursorY + 'px';
            contactTitleCursor.style.transform = `translate(-50%, -50%) scale(1) skew(${currentSkewX}deg, ${currentSkewY}deg)`;
        }
        requestAnimationFrame(animateContactCursor);
    }
    animateContactCursor();

    // Position bubble on card's interactive area
    function updateBubblePosition() {
        if (!currentCard) return;
        const interactive = currentCard.querySelector('.skill-interactive');
        if (!interactive) return;
        const rect = interactive.getBoundingClientRect();
        hoverBubble.style.left = (rect.left + rect.width / 2) + 'px';
        hoverBubble.style.top = (rect.top + rect.height / 2) + 'px';
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Handle hoverable elements
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
            document.body.classList.add('show-default-cursor');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
            document.body.classList.remove('show-default-cursor');
        });
    });

    // Update bubble position on scroll
    lenis.on('scroll', updateBubblePosition);

    // Show bubble when on card but not on interactive area
    skillCards.forEach(card => {
        const interactive = card.querySelector('.skill-interactive');

        card.addEventListener('mouseenter', () => {
            currentCard = card;
            updateBubblePosition();
            hoverBubble.classList.add('visible');
        });

        card.addEventListener('mouseleave', () => {
            currentCard = null;
            hoverBubble.classList.remove('visible');
        });

        if (interactive) {
            interactive.addEventListener('mouseenter', () => {
                hoverBubble.classList.remove('visible');
            });

            interactive.addEventListener('mouseleave', () => {
                if (currentCard) {
                    hoverBubble.classList.add('visible');
                }
            });
        }
    });

    // Handle contact title hover
    if (contactTitle) {
        contactTitle.addEventListener('mouseenter', () => {
            cursor.classList.add('on-contact-title');
            isOnContactTitle = true;
            contactCursorX = mouseX;
            contactCursorY = mouseY;
            contactTitleCursor.style.left = contactCursorX + 'px';
            contactTitleCursor.style.top = contactCursorY + 'px';
            contactTitleCursor.classList.add('visible');
        });

        contactTitle.addEventListener('mouseleave', () => {
            cursor.classList.remove('on-contact-title');
            isOnContactTitle = false;
            contactTitleCursor.classList.remove('visible');
        });
    }

    document.addEventListener('mouseenter', () => {
        cursor.classList.remove('hidden');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.add('hidden');
        hoverBubble.classList.remove('visible');
        contactTitleCursor.classList.remove('visible');
    });
}

// Header reveal animation
function initHeaderReveal() {
    const revealInners = document.querySelectorAll('.logo .reveal-inner');

    gsap.to(revealInners, {
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
    });
}

// Circle splitting interaction for skill cards
function initCircleSplitting() {
    const container = document.querySelector('.skill-card:first-child .skill-interactive');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const size = container.offsetWidth;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(svg);

    // Circle class
    class Circle {
        constructor(x, y, radius, level, parent = null) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.level = level;
            this.parent = parent;
            this.children = [];
            this.isSplit = false;
            this.element = null;
        }

        render() {
            this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.element.setAttribute('cx', this.x);
            this.element.setAttribute('cy', this.y);
            this.element.setAttribute('r', this.radius);
            this.element.setAttribute('fill', '#EAE0D5');
            this.element.setAttribute('stroke', '#1A1A1A');
            this.element.setAttribute('stroke-width', '1');
            this.element.style.cursor = this.level < 6 ? 'pointer' : 'default';
            svg.appendChild(this.element);

            // Add hover listener if splittable
            if (this.level < 6) {
                this.element.addEventListener('mouseenter', () => this.split());
            }
        }

        split() {
            if (this.isSplit || this.level >= 6) return;
            this.isSplit = true;

            // Calculate child positions (4 circles in quadrants)
            const newRadius = this.radius / 2;
            const offset = newRadius;
            const positions = [{
                    x: this.x - offset,
                    y: this.y - offset
                },
                {
                    x: this.x + offset,
                    y: this.y - offset
                },
                {
                    x: this.x - offset,
                    y: this.y + offset
                },
                {
                    x: this.x + offset,
                    y: this.y + offset
                }
            ];

            // Create children immediately at parent center
            positions.forEach(pos => {
                const child = new Circle(pos.x, pos.y, newRadius, this.level + 1, this);
                this.children.push(child);
                child.render();
                // Start at parent's position
                child.element.setAttribute('cx', this.x);
                child.element.setAttribute('cy', this.y);
                child.element.setAttribute('r', newRadius);
            });

            // Animate everything together
            const parent = this.element;
            const startTime = performance.now();
            const duration = 150;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Smooth ease-out
                const eased = 1 - Math.pow(1 - progress, 2);

                // Fade out parent
                parent.setAttribute('opacity', 1 - eased);

                // Move children to their positions
                this.children.forEach((child, i) => {
                    const targetX = positions[i].x;
                    const targetY = positions[i].y;
                    const currentX = this.x + (targetX - this.x) * eased;
                    const currentY = this.y + (targetY - this.y) * eased;
                    child.element.setAttribute('cx', currentX);
                    child.element.setAttribute('cy', currentY);
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    parent.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    // Create initial circle
    const initialRadius = size / 2 - 2; // Small padding
    const rootCircle = new Circle(size / 2, size / 2, initialRadius, 1);
    rootCircle.render();
}

// Skill Card 1 Interaction (Gravity/Physics) - REMOVED to avoid conflict with splitting interaction
/*
function initSkillCard1Physics() {
    const card1 = document.getElementById('skill-card-1');
    if (card1) {
        const container = card1.querySelector('.skill-interactive');
        const circle = container.querySelector('.circle');
        
        // Create multiple circles
        const circleCount = 5;
        const circles = [circle];
        
        for (let i = 0; i < circleCount - 1; i++) {
            const newCircle = circle.cloneNode(true);
            container.appendChild(newCircle);
            circles.push(newCircle);
        }

        // Physics variables
        const physics = circles.map(() => ({
            x: Math.random() * (container.offsetWidth - 150),
            y: Math.random() * (container.offsetHeight - 150),
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4
        }));

        function updatePhysics() {
            circles.forEach((circle, i) => {
                let p = physics[i];
                
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x <= 0 || p.x >= container.offsetWidth - 150) {
                    p.vx *= -1;
                    p.x = Math.max(0, Math.min(p.x, container.offsetWidth - 150));
                }
                if (p.y <= 0 || p.y >= container.offsetHeight - 150) {
                    p.vy *= -1;
                    p.y = Math.max(0, Math.min(p.y, container.offsetHeight - 150));
                }

                circle.style.transform = `translate(${p.x}px, ${p.y}px)`;
                // Ensure absolute positioning for movement
                circle.style.position = 'absolute';
                circle.style.left = '0';
                circle.style.top = '0';
                circle.style.margin = '0';
            });
            requestAnimationFrame(updatePhysics);
        }
        
        updatePhysics();
    }
}
*/

// Countdown timer to 4:20 PM
function initCountdownTimer() {
    const timerElement = document.querySelector('.countdown-timer');
    if (!timerElement) return;

    function updateCountdown() {
        const now = new Date();
        const target = new Date();
        target.setHours(16, 20, 0, 0);

        // If it's already past 4:20 today, count to tomorrow's 4:20
        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerElement.textContent = formatted;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Ray Sunburst Door Animation
function initPsychedelicDoor() {
    const canvas = document.getElementById('psychedelicCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const SVG_HEIGHT = 257.3;
    const RAY_COUNT = 36;

    const originalPath = [
        ['M', 1378.1, 99.2],
        ['c', -43.3, 8.2, -89.7, 14.9, -131.8, -2],
        ['c', -35.2, -14.1, -58.5, -43.8, -90.6, -62.4],
        ['c', -24.5, -14.2, -50.9, -25.2, -78.7, -30.9],
        ['c', -56.4, -11.4, -114.5, 1.4, -156.4, 42.1],
        ['c', -56, 54.4, -83.5, 133.2, -176.9, 123],
        ['c', -67.4, -7.4, -100.6, -63, -158.9, -87],
        ['c', -102.3, -42.1, -179.8, 16.3, -218.2, 74.8],
        ['s', -78, 70.9, -78, 70.9],
        ['c', 0, 0, -80.3, 36.8, -162.5, -27.2],
        ['C', 43.8, 136.4, 0, 132, 0, 132],
        ['c', 97.1, 44.5, 133.5, 87.4, 133.5, 87.4],
        ['c', 45.9, 34.5, 102.3, 49.1, 157.2, 28.2],
        ['c', 58.4, -22.3, 79.9, -71.8, 124.1, -110.6],
        ['c', 41.2, -36.2, 113.2, -43.1, 161, -15.5],
        ['c', 44.7, 25.7, 79, 63.1, 126.7, 85.9],
        ['c', 74.4, 35.7, 150.4, 2.9, 205.1, -51.5],
        ['c', 36.9, -36.7, 72.7, -82.9, 129.4, -84.2],
        ['c', 35.7, -0.8, 61.9, 18.3, 89.5, 37.9],
        ['c', 32.8, 23.3, 66.6, 45.7, 103.1, 62.9],
        ['c', 43.7, 20.5, 89.3, 31.4, 137.5, 30.8],
        ['c', 14.6, -0.2, 87.8, 1.2, 91.2, -18.9],
        ['c', 0, -0.1, 19, -111.8, 19, -111.8],
        ['c', -2.1, 12.1, -87.1, 24.4, -99.2, 26.7],
        ['Z']
    ];

    function flipY(val, isAbsolute) {
        return isAbsolute ? SVG_HEIGHT - val : -val;
    }

    function interpolate(orig, flipped, t) {
        return orig + (flipped - orig) * t;
    }

    function generatePath(t) {
        let d = '';
        for (const seg of originalPath) {
            const cmd = seg[0];
            if (cmd === 'Z') {
                d += 'Z';
                continue;
            }
            const isAbsolute = cmd === cmd.toUpperCase();
            const values = seg.slice(1);
            d += cmd;
            for (let i = 0; i < values.length; i++) {
                const isY = (i % 2 === 1);
                let val = values[i];
                if (isY) {
                    const flippedVal = flipY(val, isAbsolute);
                    val = interpolate(val, flippedVal, t);
                }
                d += (i > 0 ? ',' : '') + val.toFixed(1);
            }
        }
        return d;
    }

    let rotation = 0;
    const pathT = 0;

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillStyle = '#43302E';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        rotation += 0.3;
        ctx.rotate(rotation * Math.PI / 180);

        const scale = Math.max(width, height) / 1477.3 * 1.2;
        ctx.fillStyle = 'rgba(161, 153, 255, 0.5)';
        const pathData = generatePath(pathT);

        for (let i = 0; i < RAY_COUNT; i++) {
            ctx.save();
            ctx.rotate(i * 10 * Math.PI / 180);
            ctx.scale(scale, scale);
            ctx.translate(0, -SVG_HEIGHT / 2);
            const path2D = new Path2D(pathData);
            ctx.fill(path2D);
            ctx.restore();
        }

        ctx.restore();
        requestAnimationFrame(draw);
    }

    draw();
}

// Door Navigation
function initDoorNavigation() {
    const openDoor = document.querySelector('.contact-door-open');
    if (!openDoor) return;

    openDoor.style.cursor = 'pointer';

    function is420() {
        const now = new Date();
        return now.getHours() === 16 && now.getMinutes() === 20;
    }

    const returnPath = 'about.html#contact';
    const fromParam = '?from=' + encodeURIComponent(returnPath);

    function checkTimeAndRedirect() {
        if (is420()) {
            window.location.href = 'dramatic-exit.html' + fromParam;
        }
    }

    setInterval(checkTimeAndRedirect, 1000);
    checkTimeAndRedirect();

    openDoor.addEventListener('click', () => {
        if (is420()) {
            window.location.href = 'dramatic-exit.html' + fromParam;
        } else {
            window.location.href = 'break.html' + fromParam;
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimation();
    initMenu();
    initCustomCursor();
    initHeaderReveal();

    // Animate menu button to visible
    gsap.to(".menu-btn", {
        duration: 1.0,
        y: 0,
        opacity: 1,
        ease: "power3.out"
    });
    initCircleSplitting();
    initCountdownTimer();
    initPsychedelicDoor();
    initDoorNavigation();
    initCharSwapAnimation();
    // initSkillCard1Physics(); // Disabled to use splitting interaction instead
});

// Character Swap Animation for contact title text
function initCharSwapAnimation() {
    const charSwapElements = document.querySelectorAll('[data-char-swap]');

    charSwapElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';

        // Wrap each character in a container with original and clone
        const chars = text.split('');
        const charContainers = [];

        chars.forEach(char => {
            const container = document.createElement('span');
            container.className = 'char-swap-container';

            const original = document.createElement('span');
            original.className = 'char-swap-original';
            original.textContent = char === ' ' ? '\u00A0' : char;

            const clone = document.createElement('span');
            clone.className = 'char-swap-clone';
            clone.textContent = char === ' ' ? '\u00A0' : char;

            container.appendChild(original);
            container.appendChild(clone);
            element.appendChild(container);

            charContainers.push({
                container,
                original,
                clone
            });
        });

        // Start the animation loop after a delay
        setTimeout(() => {
            startCharSwapLoop(charContainers);
        }, 2500);
    });
}

function startCharSwapLoop(charContainers) {
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function animateSequence() {
        const shuffled = shuffleArray(charContainers);
        const count = Math.random() < 0.5 ? 1 : 2;
        const selected = shuffled.slice(0, count);

        let delay = 0;
        selected.forEach((charData) => {
            setTimeout(() => {
                animateChar(charData);
            }, delay);
            delay += 150 + Math.random() * 150;
        });

        const nextDelay = 3000 + Math.random() * 1000;
        setTimeout(animateSequence, nextDelay);
    }

    animateSequence();
}

function animateChar(charData) {
    const {
        original,
        clone
    } = charData;
    const charWidth = original.offsetWidth;
    const gap = 4;

    gsap.set(clone, {
        x: -(charWidth + gap)
    });
    gsap.set(original, {
        x: 0
    });

    const duration = 0.5;
    const ease = "power2.inOut";

    gsap.to(original, {
        x: charWidth + gap,
        duration: duration,
        ease: ease
    });

    gsap.to(clone, {
        x: 0,
        duration: duration,
        ease: ease,
        onComplete: () => {
            gsap.set(original, {
                x: -(charWidth + gap)
            });
            gsap.set(clone, {
                x: 0
            });
        }
    });
}