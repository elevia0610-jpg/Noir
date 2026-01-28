// ABOUTME: Project page scroll animations and interactions
// ABOUTME: Handles background image parallax animation and menu functionality

// --- Lenis Smooth Scroll ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
});

window.addEventListener('load', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("GSAP or ScrollTrigger not loaded!");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Connect Lenis to GSAP ScrollTrigger (single integration point)
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Ensure scroll position is updated after page load
    ScrollTrigger.refresh();

    initLazyVideos();
    initBackgroundScrollAnimation();
    initMenuToggle();

    // Animate menu button to visible
    gsap.to(".menu-btn", {
        duration: 1.0,
        y: 0,
        opacity: 1,
        ease: "power3.out"
    });
    initCustomCursor();
    initGalleryAnimations();
    initNextProjectAnimation();
    initGridColorTransition();
    initPsychedelicDoor();
    initDoorNavigation();
    initCountdownTimer();
    initLiveSiteBadge();
    initCharSwapAnimation();
    initThemeToggle();
    initFooterThemeSwitch();
    initNextProjectBadgeMagnetic();
    initNextProjectCardImageHover();
});

// Lazy load videos - only load when entering viewport
function initLazyVideos() {
    const lazyVideos = document.querySelectorAll('video[data-lazy-video]');

    lazyVideos.forEach(video => {
        const videoSrc = video.dataset.lazyVideo;

        ScrollTrigger.create({
            trigger: video,
            start: 'top bottom+=200',
            once: true,
            onEnter: () => {
                const source = document.createElement('source');
                source.src = videoSrc;
                source.type = 'video/mp4';
                video.appendChild(source);
                video.load();
                video.play().catch(() => {});
            }
        });
    });
}

// Background image scroll animation
// - Starts behind hero (100vh)
// - Scrolls to optical center of description section
// - Shrinks, rotates 15deg right, opacity 30%
// - When scroll-container ends, image scrolls with content (no longer fixed)
// - Disabled on mobile (< 768px)
function initBackgroundScrollAnimation() {
    const scrollContainer = document.querySelector('.project-scroll-container');
    const bgImage = document.querySelector('.project-bg-image');

    if (!scrollContainer || !bgImage) return;

    // Disable on mobile
    if (window.innerWidth < 768) return;

    // Pin the background image while scrolling through the container
    ScrollTrigger.create({
        trigger: scrollContainer,
        start: "top top",
        end: "bottom bottom",
        pin: bgImage,
        pinSpacing: false,
    });

    // Animation timeline - transforms while pinned
    // yPercent: 15 moves the image down by 15% of its height during scroll
    gsap.to(bgImage, {
        scrollTrigger: {
            trigger: scrollContainer,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        },
        // Keep centered horizontally
        xPercent: -50,
        yPercent: 0,
        // Shrink significantly
        scale: 0.35,
        // Rotate 15 degrees to the right
        rotation: 15,
        // Fade to 30% opacity
        opacity: 0.3,
        ease: "none"
    });
}

// Menu toggle functionality (same as main page)
function initMenuToggle() {
    const menuBtn = document.getElementById('menuBtn');
    const menuCard = document.getElementById('menuCard');
    const closeBtn = document.getElementById('closeBtn');

    if (!menuBtn || !menuCard || !closeBtn) return;

    const menuLinks = menuCard.querySelectorAll('.menu-link');
    const menuSeparator = menuCard.querySelector('.menu-separator');
    const menuFooterLinks = menuCard.querySelectorAll('.social-link');
    const menuCloseIcon = closeBtn.querySelector('svg');

    // Set initial state
    gsap.set(menuCard, {
        opacity: 0,
        visibility: 'hidden',
        scale: 0.95,
        transformOrigin: "top right"
    });

    menuBtn.addEventListener('click', () => {
        gsap.set(menuCard, {
            visibility: 'visible',
            opacity: 0,
            scale: 0.95
        });

        gsap.set('.menu-link-inner', { y: "150%", x: "0%" });
        gsap.set(menuSeparator, { scaleX: 0, opacity: 1, transformOrigin: "left center" });
        gsap.set(menuFooterLinks, { y: 20, opacity: 0 });
        gsap.set(menuCloseIcon, { rotation: -180, opacity: 0 });

        const tl = gsap.timeline();

        tl.to(menuCard, {
            duration: 0.5,
            opacity: 1,
            scale: 1,
            ease: "power3.out"
        })
        .to('.menu-link-inner', {
            duration: 0.8,
            y: "0%",
            stagger: 0.1,
            ease: "power4.out"
        }, "-=0.3")
        .to(menuSeparator, {
            duration: 0.6,
            scaleX: 1,
            ease: "power3.out"
        }, "-=0.6")
        .to(menuFooterLinks, {
            duration: 0.6,
            y: 0,
            opacity: 1,
            stagger: 0.05,
            ease: "power3.out"
        }, "-=0.5")
        .to(menuCloseIcon, {
            duration: 0.6,
            rotation: 0,
            opacity: 1,
            ease: "back.out(1.7)"
        }, "-=0.6");
    });

    const closeMenu = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(menuCard, { visibility: 'hidden' });
            }
        });

        tl.to(menuCard.querySelectorAll('.menu-link-inner'), {
            duration: 0.4,
            y: "150%",
            stagger: 0.05,
            ease: "power2.in"
        })
        .to([menuSeparator, menuFooterLinks, menuCloseIcon], {
            duration: 0.3,
            opacity: 0,
            ease: "power1.in"
        }, "-=0.3")
        .to(menuCard, {
            duration: 0.4,
            opacity: 0,
            scale: 0.95,
            ease: "power2.inOut"
        }, "-=0.2");
    };

    closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('click', (event) => {
        const isClickInsideMenu = menuCard.contains(event.target);
        const isClickOnMenuBtn = menuBtn.contains(event.target);
        const isMenuVisible = gsap.getProperty(menuCard, "opacity") > 0;

        if (!isClickInsideMenu && !isClickOnMenuBtn && isMenuVisible) {
            closeMenu();
        }
    });
}

// Custom cursor for project page
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // Get all hoverable elements
    const hoverables = document.querySelectorAll('a, button, .menu-btn, .menu-link, .social-link, .contact-social-link, .live-site-badge, .next-project-card, .next-project-badge');

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Handle hoverable elements
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.add('hidden');
    });

    document.addEventListener('mouseenter', () => {
        cursor.classList.remove('hidden');
    });
}

// Gallery animations - Grid aligned layout with scroll reveals
function initGalleryAnimations() {
    initProjectGallery();
    initStaffCardsAnimation();
    initInstaPostsAnimation();
    initBrandIdentityAnimation();
    initBekeAnimations();
    initPajtasAnimations();
    initArtifexScatteredGallery();
}

// Staff cards spread animation
function initStaffCardsAnimation() {
    const staffCardsContainer = document.querySelector('.staff-cards-container');
    if (!staffCardsContainer) return;

    const cards = staffCardsContainer.querySelectorAll('.staff-card');
    if (cards.length === 0) return;

    // Initial state: all cards stacked in center with slight rotation
    gsap.set(cards, {
        xPercent: -50,
        left: '50%',
        rotation: () => gsap.utils.random(-5, 5),
    });

    // Spread positions: overlapping cards across full width
    const spreadPositions = [
        { left: '12%', rotation: -10, zIndex: 1 },
        { left: '30%', rotation: -5, zIndex: 2 },
        { left: '50%', rotation: 2, zIndex: 3 },
        { left: '70%', rotation: 6, zIndex: 2 },
        { left: '88%', rotation: 12, zIndex: 1 },
    ];

    // Create scroll-triggered animation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: staffCardsContainer,
            start: 'top 80%',
            end: 'center center',
            scrub: 1,
        }
    });

    cards.forEach((card, index) => {
        const pos = spreadPositions[index] || spreadPositions[2];
        tl.to(card, {
            left: pos.left,
            xPercent: -50,
            rotation: pos.rotation,
            zIndex: pos.zIndex,
            duration: 1,
            ease: 'power2.out',
        }, 0);
    });
}

// Brand Identity section animation (colors & patterns)
function initBrandIdentityAnimation() {
    const brandHeroImage = document.querySelector('.brand-hero-image');
    const brandColors = document.querySelectorAll('.brand-color');
    const brandPatterns = document.querySelectorAll('.brand-pattern');

    if (!brandHeroImage && !brandColors.length && !brandPatterns.length) return;

    // Animate hero image on scroll
    if (brandHeroImage) {
        ScrollTrigger.create({
            trigger: brandHeroImage,
            start: 'top 85%',
            onEnter: () => {
                brandHeroImage.classList.add('is-visible');
            },
            once: true
        });
    }

    // Animate colors on scroll
    if (brandColors.length) {
        ScrollTrigger.create({
            trigger: '.brand-colors',
            start: 'top 80%',
            onEnter: () => {
                brandColors.forEach(color => color.classList.add('is-visible'));
            },
            once: true
        });
    }

    // Animate patterns on scroll
    if (brandPatterns.length) {
        ScrollTrigger.create({
            trigger: '.brand-patterns',
            start: 'top 80%',
            onEnter: () => {
                brandPatterns.forEach(pattern => pattern.classList.add('is-visible'));
            },
            once: true
        });
    }
}

// Instagram posts grid animation
function initInstaPostsAnimation() {
    const instaGrid = document.querySelector('.insta-posts-grid');
    if (!instaGrid) return;

    const posts = instaGrid.querySelectorAll('.insta-post');
    if (posts.length === 0) return;

    // Initial state: posts are scaled down and transparent
    gsap.set(posts, {
        scale: 0.8,
        opacity: 0,
    });

    // Staggered reveal animation on scroll
    gsap.to(posts, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: {
            amount: 0.8,
            from: 'start',
        },
        ease: 'power2.out',
        scrollTrigger: {
            trigger: instaGrid,
            start: 'top 80%',
            end: 'center center',
            toggleActions: 'play none none reverse',
        }
    });
}

// Project Gallery - jamarea inspired layout
function initProjectGallery() {
    const projectGallery = document.querySelector('.project-gallery');
    const smileyCenter = document.querySelector('.smiley-gallery-center');
    const smileyTrigger = document.querySelector('[data-smiley-trigger]');
    const galleryMedia = document.querySelectorAll('.gallery-media');
    const revealTexts = document.querySelectorAll('.reveal-text');

    if (!projectGallery) return;

    // Smiley appears after first image passes
    if (smileyCenter && smileyTrigger) {
        ScrollTrigger.create({
            trigger: smileyTrigger,
            start: 'bottom 60%',
            endTrigger: projectGallery,
            end: 'bottom 30%',
            onEnter: () => smileyCenter.classList.add('is-visible'),
            onLeave: () => smileyCenter.classList.remove('is-visible'),
            onEnterBack: () => smileyCenter.classList.add('is-visible'),
            onLeaveBack: () => smileyCenter.classList.remove('is-visible')
        });

        // Initialize liquid animation on smiley
        initSmileyLiquidAnimation();
    }

    // Image reveal animations
    galleryMedia.forEach((media) => {
        const img = media.querySelector('img');
        const speed = parseFloat(media.dataset.speed) || 1;
        const isInPostersRow = media.closest('.gallery-row-posters');
        const isInTextPosterRow = media.closest('.gallery-row-text-poster');
        const isPoster = isInPostersRow || isInTextPosterRow;

        // Skip clip-path reveal for posters
        if (!isPoster) {
            // Reveal animation
            gsap.to(media, {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.2,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: media,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            // Parallax effect for regular gallery media
            if (img) {
                const yAmount = (speed - 1) * 80;
                gsap.to(img, {
                    yPercent: yAmount,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: media,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            }
        } else {
            // Posters: move the whole element with subtle parallax
            const yAmount = (speed - 1) * 40;
            gsap.to(media, {
                y: yAmount + 'rem',
                ease: 'none',
                scrollTrigger: {
                    trigger: media.closest('.gallery-row-posters'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.6
                }
            });
        }
    });

    // Text reveal animations - scroll triggered
    revealTexts.forEach((text) => {
        ScrollTrigger.create({
            trigger: text,
            start: 'top 85%',
            onEnter: () => text.classList.add('is-revealed'),
            once: true
        });
    });

    // Poster row parallax - each poster moves at different speed
    // Disabled on mobile (< 768px)
    if (window.innerWidth >= 768) {
        const posterRows = document.querySelectorAll('.gallery-poster-row');
        posterRows.forEach((row) => {
            const posters = row.querySelectorAll('img');
            const speeds = [-80, 0, 80]; // left moves up, center stays, right moves down

            posters.forEach((poster, index) => {
                const yAmount = speeds[index] || 0;
                gsap.to(poster, {
                    y: yAmount,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: row,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            });
        });
    }
}

// Liquid animation for the gallery smiley (adapted from main page)
function initSmileyLiquidAnimation() {
    const svg = document.getElementById('smiley-gallery-svg');
    if (!svg || typeof gsap === 'undefined') return;

    const paths = Array.from(svg.querySelectorAll('path'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches || paths.length === 0) return;

    paths.forEach((path) => {
        const d = path.getAttribute('d');
        const isClosed = d && /z$/i.test(d.trim());

        createLiquidPathForGallery(path, {
            detail: 50,
            tension: 1,
            close: isClosed,
            range: { x: 250, y: 250 }
        });
    });
}

// Liquid path animation (simplified version for gallery)
// Optimized: only runs when SVG is visible in viewport
function createLiquidPathForGallery(path, options) {
    try {
        const svgPoints = pointsInPathGallery(path, options.detail);
        const originPoints = svgPoints.map(p => ({ x: p.x, y: p.y }));
        const liquidPoints = svgPoints.map(p => ({ x: p.x, y: p.y }));
        const mousePos = { x: 0, y: 0 };

        const bbox = path.getBBox();
        const maxDim = Math.max(bbox.width, bbox.height);
        const sizeFactor = Math.min(1, Math.max(0.2, maxDim / 500));

        const svg = path.closest('svg');
        let transformCoords;
        try {
            const pt = svg.createSVGPoint();
            transformCoords = function(e) {
                if (!svg.getScreenCTM()) return { x: 0, y: 0 };
                pt.x = e.clientX;
                pt.y = e.clientY;
                const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
                return { x: transformed.x, y: transformed.y };
            };
        } catch (e) {
            return;
        }

        let time = Math.random() * 1000;
        let lastMousePos = { x: 0, y: 0 };
        let mouseVelocity = { x: 0, y: 0 };
        let isVisible = false;

        // Visibility tracking for performance
        ScrollTrigger.create({
            trigger: svg,
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => { isVisible = true; },
            onLeave: () => { isVisible = false; },
            onEnterBack: () => { isVisible = true; },
            onLeaveBack: () => { isVisible = false; }
        });

        gsap.ticker.add(() => {
            if (!isVisible) return;

            time += 0.005;
            mouseVelocity.x *= 0.9;
            mouseVelocity.y *= 0.9;

            const renderPoints = liquidPoints.map((point, index) => {
                const progress = index / liquidPoints.length;
                const wave1X = Math.sin(time * 0.5 + progress * Math.PI * 2) * 12 * sizeFactor;
                const wave1Y = Math.cos(time * 0.4 + progress * Math.PI * 2) * 12 * sizeFactor;
                const wave2X = Math.sin(time * -1.2 + progress * Math.PI * 4) * 6 * sizeFactor;
                const wave2Y = Math.cos(time * -1.1 + progress * Math.PI * 4) * 6 * sizeFactor;

                return {
                    x: point.x + wave1X + wave2X,
                    y: point.y + wave1Y + wave2Y
                };
            });

            const newPathData = splineGallery(renderPoints, options.tension, options.close);
            gsap.set(path, { attr: { d: newPathData } });
        });

        window.addEventListener('mousemove', (e) => {
            const coords = transformCoords(e);
            if (!coords) return;

            mouseVelocity.x = coords.x - lastMousePos.x;
            mouseVelocity.y = coords.y - lastMousePos.y;
            lastMousePos.x = coords.x;
            lastMousePos.y = coords.y;
            mousePos.x = coords.x;
            mousePos.y = coords.y;

            liquidPoints.forEach((point, index) => {
                const pointOrigin = originPoints[index];
                const dx = mousePos.x - pointOrigin.x;
                const dy = mousePos.y - pointOrigin.y;
                const distSq = dx * dx + dy * dy;
                const rangeSq = options.range.x * options.range.x;

                if (distSq < rangeSq) {
                    const dist = Math.sqrt(distSq);
                    const force = 1 - (dist / options.range.x);
                    const dragStrength = 5.0;

                    const targetX = pointOrigin.x + (mouseVelocity.x * force * dragStrength);
                    const targetY = pointOrigin.y + (mouseVelocity.y * force * dragStrength);

                    const clampedX = gsap.utils.clamp(pointOrigin.x - 100, pointOrigin.x + 100, targetX);
                    const clampedY = gsap.utils.clamp(pointOrigin.y - 100, pointOrigin.y + 100, targetY);

                    gsap.to(point, {
                        x: clampedX,
                        y: clampedY,
                        ease: 'power2.out',
                        overwrite: 'auto',
                        duration: 0.8,
                        onComplete: () => {
                            gsap.to(point, {
                                x: pointOrigin.x,
                                y: pointOrigin.y,
                                ease: 'elastic.out(1, 0.3)',
                                duration: 3.5
                            });
                        }
                    });
                }
            });
        });
    } catch (err) {
        console.error('Error in createLiquidPathForGallery:', err);
    }
}

// Helper: get points along path
function pointsInPathGallery(path, detail) {
    const points = [];
    const len = path.getTotalLength();
    for (let i = 0; i < detail; i++) {
        const p = path.getPointAtLength((i / (detail - 1)) * len);
        points.push({ x: p.x, y: p.y });
    }
    return points;
}

// Helper: format points for spline
function formatPointsGallery(points, close) {
    points = [...points];
    if (!Array.isArray(points[0])) {
        points = points.map(({ x, y }) => [x, y]);
    }
    if (close) {
        const lastPoint = points[points.length - 1];
        const secondToLastPoint = points[points.length - 2];
        const firstPoint = points[0];
        const secondPoint = points[1];
        points.unshift(lastPoint);
        points.unshift(secondToLastPoint);
        points.push(firstPoint);
        points.push(secondPoint);
    }
    return points.flat();
}

// Helper: create smooth spline path
function splineGallery(points, tension = 1, close = false) {
    points = formatPointsGallery(points, close);
    const size = points.length;
    const last = size - 4;
    const startPointX = close ? points[2] : points[0];
    const startPointY = close ? points[3] : points[1];
    let path = 'M' + [startPointX, startPointY];
    const startIteration = close ? 2 : 0;
    const maxIteration = close ? size - 4 : size - 2;
    const inc = 2;

    for (let i = startIteration; i < maxIteration; i += inc) {
        const x0 = i ? points[i - 2] : points[0];
        const y0 = i ? points[i - 1] : points[1];
        const x1 = points[i + 0];
        const y1 = points[i + 1];
        const x2 = points[i + 2];
        const y2 = points[i + 3];
        const x3 = i !== last ? points[i + 4] : x2;
        const y3 = i !== last ? points[i + 5] : y2;
        const cp1x = x1 + ((x2 - x0) / 6) * tension;
        const cp1y = y1 + ((y2 - y0) / 6) * tension;
        const cp2x = x2 - ((x3 - x1) / 6) * tension;
        const cp2y = y2 - ((y3 - y1) / 6) * tension;
        path += 'C' + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    }
    return path;
}

// Grid and background color transition - smooth scrub-based like plus-ex.com
function initGridColorTransition() {
    const gridLines = document.querySelectorAll('.grid-background .line');
    const sections = document.querySelectorAll('[data-bg-color]');

    if (!gridLines.length || !sections.length) return;

    // Default colors (dark theme)
    const defaultBgColor = '#43302E';
    const defaultLineColor = 'rgba(255, 255, 255, 0.12)';

    sections.forEach((section) => {
        const bgColor = section.dataset.bgColor;
        const lineColor = section.dataset.lineColor;

        // Create ScrollTrigger for each section with color data
        ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => {
                gsap.to(document.body, {
                    backgroundColor: bgColor,
                    duration: 0.2,
                    ease: 'power3.out'
                });
                gsap.to(gridLines, {
                    backgroundColor: lineColor,
                    duration: 0.2,
                    ease: 'power3.out'
                });
            },
            onLeaveBack: () => {
                // Check if there's a previous section with colors
                const prevSection = findPreviousColorSection(section, sections);
                const prevBg = prevSection ? prevSection.dataset.bgColor : defaultBgColor;
                const prevLine = prevSection ? prevSection.dataset.lineColor : defaultLineColor;

                gsap.to(document.body, {
                    backgroundColor: prevBg,
                    duration: 0.2,
                    ease: 'power3.out'
                });
                gsap.to(gridLines, {
                    backgroundColor: prevLine,
                    duration: 0.2,
                    ease: 'power3.out'
                });
            }
        });
    });
}

// Helper: find previous section with color data
function findPreviousColorSection(currentSection, allSections) {
    const sectionsArray = Array.from(allSections);
    const currentIndex = sectionsArray.indexOf(currentSection);

    if (currentIndex <= 0) return null;

    // Look for previous section that's above the current one in the DOM
    for (let i = currentIndex - 1; i >= 0; i--) {
        const prevSection = sectionsArray[i];
        const prevRect = prevSection.getBoundingClientRect();
        const currentRect = currentSection.getBoundingClientRect();

        if (prevRect.bottom < currentRect.top + window.innerHeight) {
            return prevSection;
        }
    }

    return null;
}

// Next project section animation
function initNextProjectAnimation() {
    const nextProject = document.querySelector('.next-project');
    const nextProjectTitle = document.querySelector('.next-project-title-inner');
    const nextProjectLabel = document.querySelector('.next-project-label');

    if (!nextProject) return;

    // Parallax title effect
    gsap.fromTo(nextProjectTitle,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: nextProject,
                start: 'top 80%',
                end: 'top 30%',
                toggleActions: 'play none none none'
            }
        }
    );

    // Label fade in
    gsap.fromTo(nextProjectLabel,
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 0.7,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: nextProject,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );

    // Magnetic effect on hover
    const link = document.querySelector('.next-project-link');
    if (link) {
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(nextProjectTitle, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(nextProjectTitle, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    }
}

// Ray Sunburst Door Animation - matching dramatic-exit.html
// Optimized: only runs when canvas is visible in viewport
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
        if (isAbsolute) {
            return SVG_HEIGHT - val;
        } else {
            return -val;
        }
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
    let isVisible = false;
    let tickerCallback = null;

    function draw() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, width, height);

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
    }

    tickerCallback = draw;
    gsap.ticker.add(tickerCallback);

    // Only animate when canvas is visible
    ScrollTrigger.create({
        trigger: canvas,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => { isVisible = true; },
        onLeave: () => { isVisible = false; },
        onEnterBack: () => { isVisible = true; },
        onLeaveBack: () => { isVisible = false; }
    });
}

// Countdown timer to 4:20 PM
function initCountdownTimer() {
    const timerElement = document.querySelector('.countdown-timer');
    if (!timerElement) return;

    function updateCountdown() {
        const now = new Date();
        const target = new Date();
        target.setHours(16, 20, 0, 0);

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

// Béke Fesztivál specific animations
function initBekeAnimations() {
    const bekePage = document.querySelector('.beke-fesztival-page');
    if (!bekePage) return;

    // Logos animation - staggered reveal
    const logoItems = document.querySelectorAll('.beke-logo-item');
    if (logoItems.length) {
        ScrollTrigger.create({
            trigger: '.beke-logos-container',
            start: 'top 80%',
            onEnter: () => {
                logoItems.forEach(item => item.classList.add('is-visible'));
            },
            once: true
        });
    }

    // Initialize fluid logo animation
    initBekeFluidLogo();

    // Posters parallax animation - like varlak poster row
    const posterRow = document.querySelector('.beke-poster-row');
    if (posterRow) {
        const posters = posterRow.querySelectorAll('.beke-poster-media');
        const speeds = [-60, 60]; // left moves up, right moves down

        posters.forEach((poster, index) => {
            const img = poster.querySelector('img');
            if (img) {
                const yAmount = speeds[index] || 0;
                gsap.to(img, {
                    y: yAmount,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: posterRow,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }
        });
    }
}

// Pajtás Napok specific animations
function initPajtasAnimations() {
    const pajtasPage = document.querySelector('.pajtas-napok-page');
    if (!pajtasPage) return;

    // Logos animation - staggered reveal
    const logoItems = document.querySelectorAll('.pajtas-logo-item');
    if (logoItems.length) {
        ScrollTrigger.create({
            trigger: '.pajtas-logos-container',
            start: 'top 80%',
            onEnter: () => {
                logoItems.forEach(item => item.classList.add('is-visible'));
            },
            once: true
        });
    }

    // Twin images parallax - opposite movement
    const twinItems = document.querySelectorAll('.gallery-row-twin-centered .gallery-twin-item');
    if (twinItems.length === 2) {
        // First image starts lower, moves up
        gsap.fromTo(twinItems[0],
            { y: 80 },
            {
                y: -80,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.gallery-row-twin-centered',
                    start: 'top 90%',
                    end: 'bottom 10%',
                    scrub: 1
                }
            }
        );
        // Second image starts higher, moves down
        gsap.fromTo(twinItems[1],
            { y: -80 },
            {
                y: 80,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.gallery-row-twin-centered',
                    start: 'top 90%',
                    end: 'bottom 10%',
                    scrub: 1
                }
            }
        );
    }
}

// Fluid logo animation for Béke Fesztivál
function initBekeFluidLogo() {
    const svg = document.getElementById('beke-fluid-logo');
    if (!svg || typeof gsap === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const paths = Array.from(svg.querySelectorAll('path'));
    if (paths.length === 0) return;

    paths.forEach((path) => {
        const d = path.getAttribute('d');
        const isClosed = d && /z$/i.test(d.trim());

        createBekeFluidPath(path, {
            detail: 40,
            tension: 1,
            close: isClosed,
            range: { x: 400, y: 400 }
        });
    });
}

// Create fluid path animation for Béke logo - pulse only, mouse interaction on demand
// Optimized: only runs when SVG is visible in viewport
function createBekeFluidPath(path, options) {
    try {
        const svgPoints = pointsInPathBeke(path, options.detail);
        const originPoints = svgPoints.map(p => ({ x: p.x, y: p.y }));
        const liquidPoints = svgPoints.map(p => ({ x: p.x, y: p.y }));
        const mousePos = { x: 0, y: 0 };

        const bbox = path.getBBox();
        const maxDim = Math.max(bbox.width, bbox.height);
        const sizeFactor = Math.min(1, Math.max(0.3, maxDim / 800));

        const svg = path.closest('svg');
        let transformCoords;
        try {
            const pt = svg.createSVGPoint();
            transformCoords = function(e) {
                if (!svg.getScreenCTM()) return { x: 0, y: 0 };
                pt.x = e.clientX;
                pt.y = e.clientY;
                const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
                return { x: transformed.x, y: transformed.y };
            };
        } catch (e) {
            return;
        }

        let time = Math.random() * 1000;
        let lastMousePos = { x: 0, y: 0 };
        let mouseVelocity = { x: 0, y: 0 };
        let isVisible = false;

        // Visibility tracking for performance
        ScrollTrigger.create({
            trigger: svg,
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => { isVisible = true; },
            onLeave: () => { isVisible = false; },
            onEnterBack: () => { isVisible = true; },
            onLeaveBack: () => { isVisible = false; }
        });

        // Render loop - only apply subtle pulse scale, no wave distortion by default
        gsap.ticker.add(() => {
            if (!isVisible) return;

            time += 0.003;
            mouseVelocity.x *= 0.92;
            mouseVelocity.y *= 0.92;

            // Just render current liquidPoints positions (no wave distortion)
            const renderPoints = liquidPoints.map((point) => ({
                x: point.x,
                y: point.y
            }));

            const newPathData = splineBeke(renderPoints, options.tension, options.close);
            gsap.set(path, { attr: { d: newPathData } });
        });

        // Mouse interaction - deform on hover/drag
        svg.addEventListener('mousemove', (e) => {
            const coords = transformCoords(e);
            if (!coords) return;

            mouseVelocity.x = coords.x - lastMousePos.x;
            mouseVelocity.y = coords.y - lastMousePos.y;
            lastMousePos.x = coords.x;
            lastMousePos.y = coords.y;
            mousePos.x = coords.x;
            mousePos.y = coords.y;

            liquidPoints.forEach((point, index) => {
                const pointOrigin = originPoints[index];
                const dx = mousePos.x - pointOrigin.x;
                const dy = mousePos.y - pointOrigin.y;
                const distSq = dx * dx + dy * dy;
                const rangeSq = options.range.x * options.range.x;

                if (distSq < rangeSq) {
                    const dist = Math.sqrt(distSq);
                    const force = 1 - (dist / options.range.x);
                    const dragStrength = 8.0;

                    const targetX = pointOrigin.x + (mouseVelocity.x * force * dragStrength);
                    const targetY = pointOrigin.y + (mouseVelocity.y * force * dragStrength);

                    const clampedX = gsap.utils.clamp(pointOrigin.x - 150, pointOrigin.x + 150, targetX);
                    const clampedY = gsap.utils.clamp(pointOrigin.y - 150, pointOrigin.y + 150, targetY);

                    gsap.to(point, {
                        x: clampedX,
                        y: clampedY,
                        ease: 'power2.out',
                        overwrite: 'auto',
                        duration: 0.6,
                        onComplete: () => {
                            gsap.to(point, {
                                x: pointOrigin.x,
                                y: pointOrigin.y,
                                ease: 'elastic.out(1, 0.4)',
                                duration: 2.5
                            });
                        }
                    });
                }
            });
        });
    } catch (err) {
        console.error('Error in createBekeFluidPath:', err);
    }
}

// Helper: get points along path for Béke logo
function pointsInPathBeke(path, detail) {
    const points = [];
    const len = path.getTotalLength();
    for (let i = 0; i < detail; i++) {
        const p = path.getPointAtLength((i / (detail - 1)) * len);
        points.push({ x: p.x, y: p.y });
    }
    return points;
}

// Helper: format points for spline (Béke version)
function formatPointsBeke(points, close) {
    points = [...points];
    if (!Array.isArray(points[0])) {
        points = points.map(({ x, y }) => [x, y]);
    }
    if (close) {
        const lastPoint = points[points.length - 1];
        const secondToLastPoint = points[points.length - 2];
        const firstPoint = points[0];
        const secondPoint = points[1];
        points.unshift(lastPoint);
        points.unshift(secondToLastPoint);
        points.push(firstPoint);
        points.push(secondPoint);
    }
    return points.flat();
}

// Helper: create smooth spline path (Béke version)
function splineBeke(points, tension = 1, close = false) {
    points = formatPointsBeke(points, close);
    const size = points.length;
    const last = size - 4;
    const startPointX = close ? points[2] : points[0];
    const startPointY = close ? points[3] : points[1];
    let path = 'M' + [startPointX, startPointY];
    const startIteration = close ? 2 : 0;
    const maxIteration = close ? size - 4 : size - 2;
    const inc = 2;

    for (let i = startIteration; i < maxIteration; i += inc) {
        const x0 = i ? points[i - 2] : points[0];
        const y0 = i ? points[i - 1] : points[1];
        const x1 = points[i + 0];
        const y1 = points[i + 1];
        const x2 = points[i + 2];
        const y2 = points[i + 3];
        const x3 = i !== last ? points[i + 4] : x2;
        const y3 = i !== last ? points[i + 5] : y2;
        const cp1x = x1 + ((x2 - x0) / 6) * tension;
        const cp1y = y1 + ((y2 - y0) / 6) * tension;
        const cp2x = x2 - ((x3 - x1) / 6) * tension;
        const cp2y = y2 - ((y3 - y1) / 6) * tension;
        path += 'C' + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    }
    return path;
}

// Live Site Badge visibility - hide when reaching footer sections
function initLiveSiteBadge() {
    const badge = document.getElementById('liveSiteBadge');
    const footerSection = document.querySelector('.next-project-section') || document.querySelector('.other-projects');

    if (!badge || !footerSection) return;

    ScrollTrigger.create({
        trigger: footerSection,
        start: 'top bottom',
        end: 'top bottom',
        onEnter: () => badge.classList.add('is-hidden'),
        onLeaveBack: () => badge.classList.remove('is-hidden')
    });
}

// Door Navigation - click open door to go to dramatic exit page
// At 16:20 local time, automatically redirects to dramatic exit
function initDoorNavigation() {
    const openDoor = document.querySelector('.contact-door-open');
    if (!openDoor) return;

    openDoor.style.cursor = 'pointer';

    const isInSubfolder = window.location.pathname.includes('/projects/');
    const basePath = isInSubfolder ? '../' : '';

    function is420() {
        const now = new Date();
        return now.getHours() === 16 && now.getMinutes() === 20;
    }

    // Get the current page path to return to (e.g., "projects/beke.html#contact")
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const returnPath = (isInSubfolder ? 'projects/' : '') + currentPage + '#contact';
    const fromParam = '?from=' + encodeURIComponent(returnPath);

    function checkTimeAndRedirect() {
        if (is420()) {
            window.location.href = basePath + 'dramatic-exit.html' + fromParam;
        }
    }

    setInterval(checkTimeAndRedirect, 1000);
    checkTimeAndRedirect();

    openDoor.addEventListener('click', () => {
        if (is420()) {
            window.location.href = basePath + 'dramatic-exit.html' + fromParam;
        } else {
            window.location.href = basePath + 'break.html' + fromParam;
        }
    });
}

// Varlak Preview mouse-follow pattern + image trail effect
function initVarlakPreviewEffect() {
    const preview = document.getElementById('varlakPreview');
    if (!preview) return;

    // Pattern parallax effect
    const paths = preview.querySelectorAll('.varlak-preview-svg path');
    if (paths.length) {
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        preview.addEventListener('mousemove', (e) => {
            const rect = preview.getBoundingClientRect();
            targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });

        preview.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });

        function animatePattern() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            paths.forEach((path, i) => {
                const offsetX = currentX * (10 + i * 5);
                const offsetY = currentY * (8 + i * 4);
                path.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });

            requestAnimationFrame(animatePattern);
        }

        animatePattern();
    }

    // Image trail effect
    const stickerContainer = document.getElementById('varlakStickerContainer');
    if (!stickerContainer) return;

    const stickerImageSrcs = [
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/bye-alex.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/danielfy.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/desh.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/filakovo-castle.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/gipsy-concert.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/kalapj-jakab.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/molnar-tamas.jpg',
        'https://media.eszterbial.com/img/works/varlak/varlak-2026-preview/sticker/parnograszt.jpg'
    ];

    const images = stickerImageSrcs.map((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'varlak-preview-trail-image';
        stickerContainer.appendChild(img);
        return { el: img, rect: null };
    });

    Promise.all(images.map(img => {
        return new Promise(resolve => {
            if (img.el.complete) {
                img.rect = img.el.getBoundingClientRect();
                resolve();
            } else {
                img.el.onload = () => {
                    img.rect = img.el.getBoundingClientRect();
                    resolve();
                };
            }
        });
    })).then(() => {
        initVarlakMouseTrail();
    });

    function initVarlakMouseTrail() {
        let mousePos = { x: 0, y: 0 };
        let lastMousePos = { x: 0, y: 0 };
        let cacheMousePos = { x: 0, y: 0 };
        let imgPosition = 0;
        let zIndexVal = 1;
        let previewRect = preview.getBoundingClientRect();
        const threshold = 80;

        window.addEventListener('resize', () => {
            previewRect = preview.getBoundingClientRect();
        });

        preview.addEventListener('mousemove', (e) => {
            previewRect = preview.getBoundingClientRect();
            mousePos.x = e.clientX - previewRect.left;
            mousePos.y = e.clientY - previewRect.top;
        });

        function lerp(a, b, n) {
            return (1 - n) * a + n * b;
        }

        function getMouseDistance() {
            return Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y);
        }

        function showNextImage() {
            const img = images[imgPosition];
            const el = img.el;

            el.getAnimations().forEach(a => a.cancel());

            const startX = cacheMousePos.x - img.rect.width / 2;
            const startY = cacheMousePos.y - img.rect.height / 2;
            const endX = mousePos.x - img.rect.width / 2;
            const endY = mousePos.y - img.rect.height / 2;

            el.style.left = startX + 'px';
            el.style.top = startY + 'px';
            el.style.zIndex = zIndexVal;
            el.style.opacity = 1;
            el.style.transform = 'scale(1)';

            el.animate([
                { left: startX + 'px', top: startY + 'px' },
                { left: endX + 'px', top: endY + 'px' }
            ], {
                duration: 900,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            });

            el.animate([
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.2)' }
            ], {
                duration: 1000,
                delay: 400,
                easing: 'cubic-bezier(0.61, 1, 0.88, 1)',
                fill: 'forwards'
            });
        }

        function render() {
            const distance = getMouseDistance();

            cacheMousePos.x = lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
            cacheMousePos.y = lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

            if (distance > threshold) {
                showNextImage();
                zIndexVal++;
                imgPosition = (imgPosition + 1) % images.length;
                lastMousePos.x = mousePos.x;
                lastMousePos.y = mousePos.y;
            }

            requestAnimationFrame(render);
        }

        render();
    }
}

// Initialize varlak preview effect on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVarlakPreviewEffect);
} else {
    initVarlakPreviewEffect();
}

// Artifex Paired Gallery - parallax effect for columns
// Disabled on mobile (< 768px)
function initArtifexScatteredGallery() {
    // Skip parallax effects on mobile
    if (window.innerWidth < 768) return;

    // Artifex paired columns
    const pairedColumns = document.querySelectorAll('.artifex-paired-column');
    const gallery = document.querySelector('.artifex-paired-gallery');

    if (pairedColumns.length && gallery) {
        pairedColumns.forEach((column, index) => {
            // Left column moves up, right column moves down
            const direction = index === 0 ? -1 : 1;
            const yAmount = direction * 150;

            gsap.fromTo(column,
                { y: -yAmount },
                {
                    y: yAmount,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: gallery,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                }
            );
        });
    }

    // Artifex landing page parallax - subtle y movement
    const landingParallax = document.querySelector('.artifex-landing-parallax img[data-parallax]');
    if (landingParallax) {
        const speed = parseFloat(landingParallax.dataset.parallax) || 0.05;
        gsap.to(landingParallax, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
                trigger: landingParallax.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // University Portfolio paired images parallax
    const universityPairedItems = document.querySelectorAll('.university-paired-item');
    if (universityPairedItems.length > 0) {
        universityPairedItems.forEach((item, index) => {
            // Left container moves up, right container moves down
            const startY = index === 0 ? 200 : 0;
            const endY = index === 0 ? -200 : 600;

            gsap.fromTo(item,
                { y: startY },
                {
                    y: endY,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.project-gallery',
                        start: 'top 100%',
                        end: 'bottom top',
                        scrub: 1
                    }
                }
            );
        });
    }
}

// Character Swap Animation for footer text
function initCharSwapAnimation() {
    const charSwapElements = document.querySelectorAll('[data-char-swap]');

    charSwapElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';

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

            charContainers.push({ container, original, clone });
        });

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
    const { original, clone } = charData;
    const charWidth = original.offsetWidth;
    const gap = 4;

    gsap.set(clone, { x: -(charWidth + gap) });
    gsap.set(original, { x: 0 });

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
            gsap.set(original, { x: -(charWidth + gap) });
            gsap.set(clone, { x: 0 });
        }
    });
}

// Theme Toggle (Light/Dark Mode) - same as main page
function initThemeToggle() {
    // Create the controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';

    // Create the theme toggle switch
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.type = 'button';
    themeToggle.innerHTML = `
        <div class="theme-toggle-sun">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
            </svg>
        </div>
        <div class="theme-toggle-moon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </div>
    `;

    controlsContainer.appendChild(themeToggle);
    document.body.appendChild(controlsContainer);

    // Hide controls when scrolling into contact section
    ScrollTrigger.create({
        trigger: '.contact-section',
        start: 'top bottom',
        end: 'bottom bottom',
        onEnter: () => controlsContainer.classList.add('hidden'),
        onLeaveBack: () => controlsContainer.classList.remove('hidden')
    });

    // Theme is set by inline script in HTML - do not override
    const currentTheme = document.documentElement.getAttribute('data-theme');

    const sunEl = themeToggle.querySelector('.theme-toggle-sun');
    const moonEl = themeToggle.querySelector('.theme-toggle-moon');
    const sunSvg = sunEl.querySelector('svg');
    const moonSvg = moonEl.querySelector('svg');

    // Set initial visual state based on current theme
    const isDark = currentTheme === 'dark';
    if (isDark) {
        themeToggle.style.backgroundColor = 'rgba(230, 225, 221, 0.3)';
        sunEl.style.backgroundColor = 'transparent';
        moonEl.style.backgroundColor = 'rgba(67, 48, 46, 0.8)';
        gsap.set(sunSvg, { scale: 0 });
        gsap.set(moonSvg, { scale: 1 });
    }

    let isAnimating = false;

    // Smooth animation for toggle
    function animateToggle(toDark) {
        if (isAnimating) return;
        isAnimating = true;

        const duration = 0.6;
        const ease = 'power3.inOut';

        if (toDark) {
            gsap.to(sunEl, {
                backgroundColor: 'transparent',
                duration: duration,
                ease: ease
            });
            gsap.to(sunSvg, {
                scale: 0,
                rotation: 360,
                duration: duration * 0.7,
                ease: 'power4.in'
            });

            gsap.to(moonEl, {
                backgroundColor: 'rgba(67, 48, 46, 0.8)',
                duration: duration,
                ease: ease
            });
            gsap.fromTo(moonSvg,
                { scale: 0, rotation: -180 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: duration,
                    delay: duration * 0.3,
                    ease: 'elastic.out(1, 0.5)'
                }
            );

            gsap.to(themeToggle, {
                backgroundColor: 'rgba(230, 225, 221, 0.3)',
                duration: duration,
                ease: ease,
                onComplete: () => { isAnimating = false; }
            });

        } else {
            gsap.to(moonEl, {
                backgroundColor: 'transparent',
                duration: duration,
                ease: ease
            });
            gsap.to(moonSvg, {
                scale: 0,
                rotation: 180,
                duration: duration * 0.7,
                ease: 'power4.in'
            });

            gsap.to(sunEl, {
                backgroundColor: 'rgba(230, 225, 221, 0.8)',
                duration: duration,
                ease: ease
            });
            gsap.fromTo(sunSvg,
                { scale: 0, rotation: -360 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: duration,
                    delay: duration * 0.3,
                    ease: 'elastic.out(1, 0.5)'
                }
            );

            gsap.to(themeToggle, {
                backgroundColor: 'rgba(67, 48, 46, 0.3)',
                duration: duration,
                ease: ease,
                onComplete: () => { isAnimating = false; }
            });
        }
    }

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        if (isAnimating) return;

        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        animateToggle(newTheme === 'dark');
        document.documentElement.setAttribute('data-theme', newTheme);
    });
}

// Scroll-based theme switch for project pages
function initFooterThemeSwitch() {
    const marquee = document.querySelector('.contact-marquee-wrapper');
    if (!marquee) return;

    function switchTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeToggleVisuals(newTheme === 'dark');
    }

    ScrollTrigger.create({
        trigger: marquee,
        start: 'center center',
        onEnter: switchTheme,
        onLeaveBack: switchTheme
    });
}

// Helper to update theme toggle button visuals without triggering click
function updateThemeToggleVisuals(isDark) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const sunEl = themeToggle.querySelector('.theme-toggle-sun');
    const moonEl = themeToggle.querySelector('.theme-toggle-moon');
    const sunSvg = sunEl?.querySelector('svg');
    const moonSvg = moonEl?.querySelector('svg');

    if (!sunEl || !moonEl || !sunSvg || !moonSvg) return;

    const duration = 0.6;
    const ease = 'power3.inOut';

    if (isDark) {
        gsap.to(sunEl, { backgroundColor: 'transparent', duration, ease });
        gsap.to(sunSvg, { scale: 0, rotation: 360, duration: duration * 0.7, ease: 'power4.in' });
        gsap.to(moonEl, { backgroundColor: 'rgba(67, 48, 46, 0.8)', duration, ease });
        gsap.to(moonSvg, { scale: 1, rotation: 0, duration, ease: 'elastic.out(1, 0.5)' });
        gsap.to(themeToggle, { backgroundColor: 'rgba(230, 225, 221, 0.3)', duration, ease });
    } else {
        gsap.to(moonEl, { backgroundColor: 'transparent', duration, ease });
        gsap.to(moonSvg, { scale: 0, rotation: 180, duration: duration * 0.7, ease: 'power4.in' });
        gsap.to(sunEl, { backgroundColor: 'rgba(230, 225, 221, 0.8)', duration, ease });
        gsap.to(sunSvg, { scale: 1, rotation: 0, duration, ease: 'elastic.out(1, 0.5)' });
        gsap.to(themeToggle, { backgroundColor: 'rgba(67, 48, 46, 0.3)', duration, ease });
    }
}

// Next Project Badge - Flower Hug Effect (same as view-all-circle on index page)
function initNextProjectBadgeMagnetic() {
    const badge = document.querySelector('.next-project-badge');
    if (!badge) return;

    const badgeIcon = badge.querySelector('.next-project-badge-icon');
    if (!badgeIcon) return;

    const iconRect = badgeIcon.getBoundingClientRect();
    const flowerSize = iconRect.width || 70;

    // Replace beige flower img with inline SVG for manipulation
    const beigeFlowerSVG = `
        <svg class="next-project-badge-icon beige-flower-svg" viewBox="0 0 31.1 28.3" xmlns="http://www.w3.org/2000/svg">
            <path class="beige-petal-right" d="M23.3,9.7c3.5-2,3.5-7,0-9s-7.8.5-7.8,4.5v18c0,4,4.3,6.5,7.8,4.5s3.5-7,0-9c3.5,2,7.8-.5,7.8-4.5s-4.3-6.5-7.8-4.5Z" fill="#e6e1dd"/>
            <path class="beige-petal-left" d="M7.8.7c-3.5,2-3.5,7,0,9C4.3,7.7,0,10.2,0,14.2s4.3,6.5,7.8,4.5c-3.5,2-3.5,7,0,9s7.8-.5,7.8-4.5V5.2C15.6,1.2,11.2-1.3,7.8.7Z" fill="#e6e1dd"/>
            <g class="beige-flower-face">
                <path class="beige-eye-left" d="M14.3,11.3c-1.2,1.2-3.2,1.2-4.4,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
                <path class="beige-eye-right" d="M21.1,11.3c-1.2,1.2-3.2,1.2-4.4,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
                <path class="beige-mouth" d="M22.2,14.3c-3.7,3.7-9.6,3.7-13.3,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
            </g>
        </svg>
    `;

    badgeIcon.outerHTML = beigeFlowerSVG;
    const beigeFlower = badge.querySelector('.beige-flower-svg');
    const beigePetalLeft = beigeFlower.querySelector('.beige-petal-left');
    const beigeFace = beigeFlower.querySelector('.beige-flower-face');

    // Create purple flower cursor
    const flowerCursor = document.createElement('div');
    flowerCursor.className = 'flower-hug-cursor';
    flowerCursor.style.width = flowerSize + 'px';
    flowerCursor.style.height = flowerSize + 'px';
    flowerCursor.innerHTML = `
        <svg class="purple-flower-svg" viewBox="0 0 31.1 28.3" xmlns="http://www.w3.org/2000/svg">
            <path class="purple-petal-right" d="M23.3,9.7c3.5-2,3.5-7,0-9s-7.8.5-7.8,4.5v18c0,4,4.3,6.5,7.8,4.5s3.5-7,0-9c3.5,2,7.8-.5,7.8-4.5s-4.3-6.5-7.8-4.5Z" fill="#b99eff"/>
            <path class="purple-petal-left" d="M7.8.7c-3.5,2-3.5,7,0,9C4.3,7.7,0,10.2,0,14.2s4.3,6.5,7.8,4.5c-3.5,2-3.5,7,0,9s7.8-.5,7.8-4.5V5.2C15.6,1.2,11.2-1.3,7.8.7Z" fill="#b99eff"/>
            <path class="purple-arm" d="M24,18 c3,.6 6.5,0 9.5,-1.5" fill="none" stroke="#b99eff" stroke-width="4" stroke-linecap="round" opacity="0"/>
            <g class="purple-flower-face">
                <path class="purple-eye-left" d="M14.3,11.3c-1.2,1.2-3.2,1.2-4.4,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
                <path class="purple-eye-right" d="M21.1,11.3c-1.2,1.2-3.2,1.2-4.4,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
                <path class="purple-mouth" d="M22.2,14.3c-3.7,3.7-9.6,3.7-13.3,0" fill="none" stroke="#1a1a1a" stroke-linecap="round" stroke-miterlimit="10"/>
            </g>
        </svg>
    `;
    document.body.appendChild(flowerCursor);

    const purplePetalRight = flowerCursor.querySelector('.purple-petal-right');
    const purpleFace = flowerCursor.querySelector('.purple-flower-face');
    const purpleArm = flowerCursor.querySelector('.purple-arm');

    // State
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let isHovering = false;
    let isHugging = false;
    let isLeaving = false;
    let originalCenter = null;

    function getBadgeCenter() {
        if (originalCenter && (isHovering || isLeaving)) {
            return originalCenter;
        }
        const rect = badge.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function cacheOriginalCenter() {
        gsap.set(badge, { x: 0, y: 0, scale: 1 });
        const rect = badge.getBoundingClientRect();
        originalCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    const HUG_THRESHOLD = 60;
    const UNHUG_THRESHOLD = 90;
    const MAGNETIC_STRENGTH = 0.25;

    function animate() {
        if (isHovering || isLeaving) {
            const center = getBadgeCenter();
            const dx = center.x - mouseX;
            const dy = center.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const badgeRect = badge.getBoundingClientRect();
            const maxMagneticDist = badgeRect.width;
            const magneticStrength = Math.max(0, 1 - distance / maxMagneticDist) * 20;
            const offsetX = -dx / distance * magneticStrength || 0;
            const offsetY = -dy / distance * magneticStrength || 0;
            const badgeScale = 1 + Math.max(0, 1 - distance / maxMagneticDist) * 0.12;

            gsap.to(badge, {
                x: offsetX,
                y: offsetY,
                scale: badgeScale,
                duration: 0.4,
                ease: 'power2.out'
            });

            const pullStrength = Math.max(0, 1 - distance / 100) * MAGNETIC_STRENGTH;

            let targetX = mouseX + dx * pullStrength;
            let targetY = mouseY + dy * pullStrength;

            if (distance < HUG_THRESHOLD && !isHugging) {
                isHugging = true;
                triggerHugAnimation();
            }

            if (distance > UNHUG_THRESHOLD && isHugging) {
                resetHugAnimation();
            }

            if (isHugging) {
                targetX = center.x + offsetX - flowerSize * 0.25;
                targetY = center.y + offsetY;
            }

            cursorX += (targetX - cursorX) * 0.12;
            cursorY += (targetY - cursorY) * 0.12;

            flowerCursor.style.left = cursorX + 'px';
            flowerCursor.style.top = cursorY + 'px';
        }

        requestAnimationFrame(animate);
    }
    animate();

    function triggerHugAnimation() {
        gsap.to(purplePetalRight, {
            scaleX: 0.8,
            x: -3,
            transformOrigin: 'left center',
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(purpleFace, {
            x: 2,
            scale: 0.85,
            rotation: 10,
            transformOrigin: 'center center',
            duration: 0.35,
            ease: 'power2.out'
        });

        gsap.to(purpleArm, { opacity: 1, x: -5, y: 1, rotation: 15, transformOrigin: 'left center', duration: 0.3 });

        gsap.to(beigePetalLeft, {
            scaleX: 0.8,
            x: 3,
            transformOrigin: 'right center',
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(beigeFace, {
            x: 2,
            scale: 0.85,
            rotation: -10,
            transformOrigin: 'center center',
            duration: 0.35,
            ease: 'power2.out'
        });
    }

    function resetHugAnimation() {
        isHugging = false;

        gsap.to(purplePetalRight, {
            scaleX: 1,
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
        gsap.to(purpleFace, {
            x: 0,
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
        gsap.to(purpleArm, {
            opacity: 0,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.25
        });

        gsap.to(beigePetalLeft, {
            scaleX: 1,
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
        gsap.to(beigeFace, {
            x: 0,
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    let leaveTimeout = null;

    badge.addEventListener('mouseenter', () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }

        cacheOriginalCenter();

        isHovering = true;
        isLeaving = false;
        cursorX = mouseX;
        cursorY = mouseY;
        flowerCursor.classList.add('visible');

        const customCursor = document.querySelector('.custom-cursor');
        if (customCursor) customCursor.classList.add('on-flower-hug');
    });

    badge.addEventListener('mouseleave', () => {
        isHovering = false;
        isLeaving = true;
        resetHugAnimation();

        gsap.to(badge, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
        });

        leaveTimeout = setTimeout(() => {
            isLeaving = false;
            originalCenter = null;
            flowerCursor.classList.remove('visible');
            const customCursor = document.querySelector('.custom-cursor');
            if (customCursor) customCursor.classList.remove('on-flower-hug');
        }, 400);
    });
}

// Next project card image hover - scale down effect (like works.html)
function initNextProjectCardImageHover() {
    const cardImages = document.querySelectorAll('.next-project-card-image img');
    const baseScale = 1.15;

    cardImages.forEach(img => {
        const card = img.closest('.next-project-card');

        gsap.set(img, { scale: baseScale });

        card.addEventListener('mouseenter', () => {
            gsap.to(img, {
                scale: 1,
                duration: 0.8,
                ease: "power3.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(img, {
                scale: baseScale,
                duration: 0.6,
                ease: "power2.inOut"
            });
        });
    });
}
